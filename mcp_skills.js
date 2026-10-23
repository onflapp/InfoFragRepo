const { z } = require("zod");
const { ReadResourceRequestSchema } = require("@modelcontextprotocol/sdk/types.js");
const { ResourceTemplate } = require("@modelcontextprotocol/sdk/server/mcp.js");
const utils = require('./utils.js');
const fs = require('fs-extra');
const matter = require('gray-matter');

function make_skill_item(name, desc, text) {
  // Format the skill entries according to the SEP-2640 spec

  let cha = utils.make_sha256(text);
  let it = {
    uri: "skill://"+name+"/SKILL.md",
    frontmatter: {
      name: name,
      description: desc,
    },
    resources: [
      {
        uri: "skill://"+name+"/SKILL.md",
        digest: cha,
        size: text.length,
        content: text
      }
    ]
  };

  return it;
}

function read_skills() {
  let rv = {};
  let text = utils.read_text('./docs/SKILL.md');
  let rec = matter(text);

  let it = make_skill_item(rec.data.name, rec.data.description, text);

  rv[it.frontmatter.name] = it;

  return rv;
}

function init_skills_handler(mcp) {

  const SKILLS_DB = read_skills();

  mcp.server.setRequestHandler(
    z.object({
      method: z.literal("skills/list"),
      params: z.object({ cursor: z.string().optional() }).passthrough().optional()
    }),
    async (request) => {
      const cursor = request.params?.cursor;
      const skillsList = Object.values(SKILLS_DB);

      return {
        skills: skillsList
        // nextCursor: null (Include if implementing pagination)
      };
    }
  );

  mcp.server.setRequestHandler(
    z.object({ 
      method: z.literal("skills/get"),
      params: z.object({}).passthrough().optional() 
    }), 
    async (request) => {
      const { name } = request.params || {};
      const url = new URL(name);
      const skillName = url.host;

      const skill = SKILLS_DB[skillName];
      if (!skill) {
        throw new Error(`Skill not found: ${name}`);
      }

      return {
        skill: skill
      };
    }
  );

  Object.values(SKILLS_DB).forEach((it) => {
    const name = it.frontmatter.name;
    const uri = 'skill://'+name+'/SKILL.md';
    const text = it.resources[0].content;
    const desc = it.frontmatter.description;

    mcp.registerResource(name, uri, { description: desc },
      async (uri) => ({
        contents: [{
          uri: uri,
          mimeType: 'text/markdown',
          text: text
        }]
      })
    );
  });

  /*
  mcp.server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
    const { uri } = request.params || {};
    
    if (uri.startsWith("skill://")) {
      // Parse the skill name and path from the URI
      const url = new URL(uri);
      const skillName = url.host;
      const filePath = url.pathname; // e.g., "/SKILL.md"
      
      const skill = SKILLS_DB[skillName];
      const file = skill?.resources.find(f => f.uri === uri);
      
      if (file) {
        return {
          contents: [{
            uri: file.uri,
            mimeType: "text/markdown",
            text: file.content
          }]
        };
      }
      throw new Error(`Resource not found: ${uri}`);
    }
    else if (uri.startsWith("skill://index")) {
      const skills = list_skills(SKILLS_DB);
      const catalogue = skills.map((s) => ({
        name: s.name,
        description: s.description,
        uri: `skill://${s.id}/SKILL.md`,
        files: s.files.map((f) => `skill://${s.id}/${f}`),
      }));
      return {
        contents: [
          { uri: uri.href, mimeType: "application/json", text: JSON.stringify(catalogue, null, 2) },
        ],
      };
    }
    
    throw new Error("Unsupported resource type");
  });
  */

}

module.exports = {
  init_skills_handler: init_skills_handler
};
