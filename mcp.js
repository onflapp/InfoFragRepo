const SearchIndex = require('./SearchIndex');
const Repository = require('./Repository');

const { McpServer } = require("@modelcontextprotocol/sdk/server/mcp.js");
const { StdioServerTransport } = require("@modelcontextprotocol/sdk/server/stdio.js");
const { SSEServerTransport } = require("@modelcontextprotocol/sdk/server/sse.js");

const { z } = require("zod");
const fs = require('fs-extra');
const paths = require('path');
const utils = require('./utils.js');

const config = utils.read_json('./config.json');
const server = new McpServer({ name: "information fragment repostiory", version: "0.1.0" });

const BASE = config.repositoryBase || './_repository';
const search = new SearchIndex(BASE);
const repo = new Repository(BASE);

/*
 * npx @modelcontextprotocol/inspector --tui node ./mcp.js
 * */

server.registerTool(
  "get_information",
  {
    title: "Get fragment respository information",
    description: "Return information about fragments stored in this repository",
    inputSchema: {
    }
  },
  async ({ id }) => {
    let rv = await search.listGroups();
    let text = `The fragment repository is a collection of notes and documents organized into groups. 
Groups can be used to separate different knowledge areas (e.g. projects, customers topics).
Its purpose is to be personal knowledge base.
Each fragment is either a text comment (e.g. meeting notes, to-dos).
or a document file (e.g. emails, PDFs, screenshots, spreadsheets) with a short comment attached.
Individual fragments are identified by unique paths.`;

    if (rv.length) {
      text += 'It contains following groups with fragment count and date of earliest/latest update:\n';
      for (const item of rv) {
        text += '- ' + item.name + ', count: ' + item.count + ' '; 
        text += 'from: ' + (new Date(item.start).toISOString()) + ' to ' + (new Date(item.end).toISOString()) + '\n';
      }
    }

    return {
      content: [{ 
        type: "text",
        text: text 
      }] 
    };
  }
);

server.registerTool(
  "read_fragment_content",
  {
    title: "Read content",
    description: "Return full content of fragment identified by unique path",
    inputSchema: {
      path: z.string().describe("unique path of the fragment")
    }
  },
  async ({ path }) => {
    let rv = await repo.readFragmentContentAtPath(path);

    return {
      content: [{ 
        type: "text",
        text: (rv || '')
      }] 
    };
  }
);

server.registerTool(
  "create_fragment_content",
  {
    title: "Capture content in new fragment",
    description: "Capture content and store it in new fragment. This infromation might be used to ammend or correct fragments stored in the repository.",
    inputSchema: {
      group: z.string().optional().describe("optional group"),
      timestamp: z.iso.datetime().optional().describe("time stamp of the content"),
      content: z.string().describe("text content")
    }
  },
  async ({ group, timestamp, content }) => {
    let ts = timestamp;
    let tx = content;

    if (!ts) ts = new Date().toISOString();
    if (ts.length < 24) ts += ':00.000Z';
   
    let info = {
      type: 'Captured Text Comment',
      group: group,
      title: '',
      comments: tx,
      timestamp: ts
    };

    let rv = await repo.createFragment(info);
    search.indexPath(rv);

    return {
      content: [{ 
        type: "text",
        text: ''
      }] 
    };
  }
);

server.registerTool(
  "search_fragments",
  {
    title: "Search Information Fragments",
    description:
      "Search for information contained in comments or content of assocoated document that fit specific criteria.",
    inputSchema: {
      query: z.string().describe("space-separated search terms"),
      group: z.string().optional().describe("optional group"),
      since: z.iso.datetime().optional().describe("from specific time and date"),
      until: z.iso.datetime().optional().describe("up to specific time and date"),
      limit: z.number().int().min(1).max(1000).default(10).describe("max fragments to return")
    },
  },
  async ({ group, query, since, until, limit }) => {
    let filter = {};

    if (group) filter.group = group;
    if (since) filter.start = new Date(since).getTime();
    if (until) filter.end = new Date(until).getTime();

    let items = await search.searchText(query, filter, { content: false, summary: true });
    let text = '';
    let n = 0;

    for (const item of items) {
      if (limit && n >= limit) break;
      n++;

      text += '\n<-! start of the fragment with path '+item.path+' -->\n';
      text += '\n# fragment: ' +item.title + '\n';
      text += item.type + '\n';
      text += 'last update: ' + item.timestamp.toISOString()+ '\n';

      if (item.group) {
        text += 'belongs to group: '+item.group+ '\n';
      }

      if (item.matches && item.matches.length > 0) {
        text += '\n### content contains following matches:\n';
        for (const m of item.matches) {
          text += '- ' + m + '\n';
        }
      }

      if (item.summary) {
        text += '\n### summary of the content:\n'+ item.summary+ '\n<!-- end of the summary -->\n';
      }

      if (item.comments) {
        text += '\n### comments:\n'+ item.comments + '\n<!-- end of the comment -->\n';
      }

      if (item.content) {
        text += '\n### full content:\n'+ item.content + '\n<!-- end of the content -->\n';
      }

      text += '\n<!-- end of the fragment with path '+item.path+'-->\n';
    }
    
    return {
      content:[{
        type: 'text',
        text: text
      }]
    };
  }
);

server.registerTool(
  "list_fragments",
  {
    title: "List All Information Fragments",
    description:
      "List all information fragments that fit specified criteria. Most recent fragments are on the top.",
    inputSchema: {
      group: z.string().optional().describe("optional group"),
      since: z.iso.datetime().optional().describe("from specific time and date"),
      until: z.iso.datetime().optional().describe("up to specific time and date"),
      limit: z.number().int().min(1).max(1000).default(10).describe("max fragments to return"),
    },
  },
  async ({ group, since, until, limit }) => {
    let filter = {};

    if (group) filter.group = group;
    if (since) filter.start = new Date(since).getTime();
    if (until) filter.end = new Date(until).getTime();

    let items = await search.listAll(filter, { content: true, summary: true });
    let text = '';
    let n = 0;

    for (const item of items) {
      if (limit && n >= limit) break;
      n++;

      text += '\n<-! start of the fragment with path '+item.path+' -->\n';
      text += '\n# fragment: ' +item.title + '\n';
      text += item.type + '\n';
      text += 'last update: ' + item.timestamp.toISOString()+ '\n';

      if (item.group) {
        text += 'belongs to group: '+item.group+ '\n';
      }

      if (item.comments) {
        text += '\n### comments:\n'+ item.comments + '\n<!-- end of the comment -->\n';
      }

      if (item.summary) {
        text += '\n### summary of the content:\n'+ item.summary+ '\n<!-- end of the summary -->\n';
      }
      else if (item.content && item.content.length < 1000) {
        text += '\n### full content:\n'+ item.content + '\n<!-- end of the content -->\n';
      }

      text += '\n<!-- end of the fragment with path '+item.path+'-->\n';
    }
    
    return {
      content:[{
        type: 'text',
        text: text
      }]
    };
  }
);

let transport = null;

function init_remote_server(app) {
  app.get("/sse", async (req, res) => {
    transport = new SSEServerTransport("/messages", res);
    await server.connect(transport);
  });

  app.post("/messages", async (req, res) => {
    if (transport) {
      await transport.handleMessage(req, res);
    } 
    else {
      res.status(400).send("No active SSE session found.");
    }
  });

  console.log('remote MCP server running');
}

function init_local_server() {
  transport = new StdioServerTransport();
  server.connect(transport).then(function() {
    console.error(`mcp server`);
  });
}

init_local_server();
