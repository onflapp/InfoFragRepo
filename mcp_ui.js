const { z } = require("zod");
const utils = require('./utils.js');

function init_ui_handler(mcp) {
  const UI_URI = 'ui://infofragrepo/show-records';
  const RESOURCE_MIME_TYPE = 'text/html;profile=mcp-app';

  mcp.registerTool(
    'show_records',
    {
      title: 'Show Records',
      description: 'Show list of records in an interactive view.',
      inputSchema: { 
        records: z.array(z.string()).describe('list of fragment paths to display')
      },
      _meta: { 
        ui: { 
          resourceUri: UI_URI
        }
      },
    },
    async ({ records }) => {
      return {
        content: [{ type: 'text', text: `Records: ${records.join(', ')}` }],
        structuredContent: { records },
      };
    },
  );

  mcp.registerResource('Records View', UI_URI, { mimeType: RESOURCE_MIME_TYPE },
    async () => ({
      contents: [{
        uri: UI_URI,
        mimeType: RESOURCE_MIME_TYPE,
        text: utils.read_text('./ui/show-records.html'),
        _meta: { ui: { 
          csp: { resourceDomains: ['http://localhost', 'http://localhost:3000'] },
          preferredDisplayMode: "fullscreen"
        } },
      }],
    }),
  );
}

module.exports = {
  init_ui_handler: init_ui_handler
};
