Install node.js
---
All developing commands described below require [node.js](https://nodejs.org) to be installed on the system.

Download dependencies
---
All application dependencies (both for developing and running) will be downloaded in `/node_modules`. Please keep that folder in `.gitignore`.
```bash
npm install
```

Enter development mode
---
This command will watch your code for compiling while it changes, serving it at <http://localhost:3000>.
```bash
npm run start
```

Build application
---
`/build` will contain the production-ready application.
```bash
npm run build
```