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
Individual fragments are identified by unique paths.`

    if (rv.length) {
      text += 'It contains following groups:\n';
      for (const item of rv) {
        text += '- ' + item.name + '\n';
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
      path: z.string().describe("unique path of the fragment"),
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
  "search_fragments",
  {
    title: "Search Information Fragments",
    description:
      "Search for information contained in comments or content of assocoated document that fit specific criteria.",
    inputSchema: {
      query: z.string().describe("space-separated search terms"),
      group: z.string().optional().describe("optional group"),
      limit: z.number().int().min(1).max(1000).default(10).describe("max fragments to return")
    },
  },
  async ({ group, query }) => {
    let filter = null;

    let items = await search.searchText(query, filter, { content: false});
    let text = '';

    for (const item of items) {
      text += '\n<-! start of the fragment with path '+item.path+' -->\n';
      text += '\n# fragment: [' +item.title + '](http://localhost:3000/'+item.path+')\n';
      text += item.type + '\n';

      if (item.group) {
        text += 'belongs to group: '+item.group+ '\n';
      }

      if (item.matches && item.matches.length > 0) {
        text += '\ncontain includes following matches:\n';
        for (const m of item.matches) {
          text += '- ' + m + '\n';
        }
      }

      if (item.comments) {
        text += '\n### comments:\n'+ item.comments + '\n<!-- end of the comment -->\n';
      }

      if (item.content) {
        text += '\n### content:\n'+ item.content + '\n<!-- end of the content -->\n';
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
      "List all information fragments that fit specified criteria",
    inputSchema: {
      group: z.string().optional().describe("optional group"),
      limit: z.number().int().min(1).max(1000).default(10).describe("max fragments to return"),
    },
  },
  async ({ group, query }) => {
    let filter = null;

    let items = await search.listAll(filter);
    let text = '';

    for (const item of items) {
      text += '\n<-! start of the fragment with path '+item.path+' -->\n';
      text += '\n# fragment: [' +item.title + '](http://localhost:3000/'+item.path+')\n';
      text += item.type + '\n';

      if (item.group) {
        text += 'belongs to group: '+item.group+ '\n';
      }

      if (item.comments) {
        text += '\n### comments:\n'+ item.comments + '\n<!-- end of the comment -->\n';
      }

      if (item.content) {
        text += '\n### content:\n'+ item.content + '\n<!-- end of the content -->\n';
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
