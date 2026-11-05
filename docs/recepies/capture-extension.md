create browser extension that will do the following:

- take screenshot of current website
- extract text content using "readability" and convert it to markdown
- upload the screenshot and content to REST end point "http://localhost:3000/api/capture"

the end point expects the following parameters:
- Content-Type: multipart/form-data
- datafile: file type containing the screenshot
- resource: url of the website
- title: title of the website
- type: set to "Remote Website Link"
- textcontent: extracted content of the website as markdown
- groupname: optional parameters
- textcomment: optional text
