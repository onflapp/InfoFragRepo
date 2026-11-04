# List All Groups

GET /api/groups

### example return value
```
[
  {
    "name": "Group A",           /* name of the group */
    "count": 2,                  /* number of documents in the group */
    "start": 1789723440000,      /* earliest timestamp */ 
    "end": 1789737780000         /* latest timestamp */
  }
]
```

# List All Documents

GET /api/list?group=<group>

### example return value
```
[
  {
    "type": "Document File",                                      /* type of the document, useful for sorting or grouping */
    "title": "my title",                                          /* human readable title */
    "resource": "document.pdf",                                   /* internal name of the resource */
    "timestamp": "2026-09-26T08:29:00.000Z",                      /* time stamp of the document, useful for sorting */
    "comments": "",                                               /* comment associated with the document, might be empty */
    "group": "Personal",                                          /* group, useful for sorting or grouping */
    "resourceURL": "file:///a/b/c/7fd771d9-d8b4-4574-8a60-85be2d119f78.pdf", /* external URL pointing to the underlying resource */
    "path": "1791733505403-681999336",                            /* path to the document, used for navigation and as primary id */
    "thumbnail": "thumbnail.png",                                 /* optional thumbnail as png, can be loaded by GET /api/resource/<document path>/thumbnail.png */
    "preview": "preview.pdf",                                     /* optional preview as pdf or png, can be loaded by GET /api/resource/<document path>/preview.pdf */
  }
]
```

# Capture Information Fragment

POST /api/capture

Creates a new fragment in the repository, either from an uploaded file or from plain text. The fragment is indexed for search after creation.

Content-Type: multipart/form-data
- datafile
- filename
- groupname
- type        - optional type (e.g. Document File or Text Comment)
- textcomment - comments associated with this document
- textcontent - optional textual content of this document (if not present, it will be generated from the datafile)
- modified

### example file upload
```
curl -X POST http://localhost:3000/api/capture \
  -F "datafile=@./report.pdf" \
  -F "groupname=research" \
  -F "filename=report.pdf" \
  -F "textcomment=Final Q3 report"
```

### example text note without file
```
curl -X POST http://localhost:3000/api/capture \
  -F "groupname=research" \
  -F "title=Meeting notes" \
  -F "textcomment=Discussed Q3 roadmap. Follow up on budget." \
  -F "modified=2025-01-15T10:30"
```

### example link or remote site with preview

textcontent must be filled. 
datafile can contain preview of this content in pdf or png format.
filename can contain URL to remote resource

```
curl -X POST http://localhost:3000/api/capture \
  -F "datafile=@./preview.pdf" \
  -F "filename=http://www.xyz.com" \
  -F "groupname=research" \
  -F "title=Meeting notes" \
  -F "textcontent=Actual content of the site" \
  -F "modified=2025-01-15T10:30"
```

# Access Content Directly

GET /api/resource<path>

Request content at specific path


