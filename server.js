const http = require('http');

const PORT = 5174;
const ITEMS_PER_PAGE = 10;
const TOTAL_ITEMS = 50;

// Generate mock data
const sections = [];
const kinds = ['hero', 'card', 'quote'];
for (let i = 0; i < TOTAL_ITEMS; i++) {
  sections.push({
    kind: kinds[i % 3],
    index: i
  });
}

const sectionDetails = {};
for (let i = 0; i < TOTAL_ITEMS; i++) {
  const kind = kinds[i % 3];
  sectionDetails[`${kind}:${i}`] = {
    kind,
    index: i,
    title: `${kind.charAt(0).toUpperCase() + kind.slice(1)} Item ${i}`,
    text: `This is the description for ${kind} item number ${i}. Lorem ipsum dolor sit amet.`,
    image: `https://picsum.photos/seed/${i}/400/300`
  };
}

function handleRequest(req, res) {
  const url = new URL(req.url, `http://localhost:${PORT}`);

  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // GET /api/sections?page=0
  if (url.pathname === '/api/sections') {
    const page = parseInt(url.searchParams.get('page') || '0', 10);
    const start = page * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    const items = sections.slice(start, end);
    const hasMore = end < sections.length;

    // Simulate network delay
    setTimeout(() => {
      res.writeHead(200);
      res.end(JSON.stringify({
        items,
        nextPage: hasMore ? page + 1 : null,
        totalItems: TOTAL_ITEMS
      }));
    }, 300);
    return;
  }

  // GET /api/section?kind=hero&index=0
  if (url.pathname === '/api/section') {
    const kind = url.searchParams.get('kind');
    const index = url.searchParams.get('index');
    const key = `${kind}:${index}`;
    const data = sectionDetails[key];

    // Simulate network delay
    setTimeout(() => {
      if (data) {
        res.writeHead(200);
        res.end(JSON.stringify(data));
      } else {
        res.writeHead(404);
        res.end(JSON.stringify({ error: 'Not found' }));
      }
    }, 200);
    return;
  }

  // 404 for other routes
  res.writeHead(404);
  res.end(JSON.stringify({ error: 'Not found' }));
}

const server = http.createServer(handleRequest);

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Mock API server running at http://localhost:${PORT}`);
  console.log(`Also accessible at http://192.168.1.152:${PORT}`);
  console.log('\nEndpoints:');
  console.log(`  GET /api/sections?page=0  - Get paginated sections`);
  console.log(`  GET /api/section?kind=hero&index=0  - Get section details`);
});
