// app/api/github/route.js
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const repo = searchParams.get('repo');
  const path = searchParams.get('path');
  const token = request.headers.get('x-github-token');

  try {
    const res = await fetch(`https://api.github.com/repos/${repo}/contents/${path}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github.v3+json',
      },
    });
    const data = await res.json();
    if (!res.ok) return Response.json({ error: data.message }, { status: res.status });

    const content = Buffer.from(data.content, 'base64').toString('utf-8');
    return Response.json({ content, sha: data.sha });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(request) {
  const { repo, path, content, sha, token, message } = await request.json();

  try {
    const encoded = Buffer.from(content, 'utf-8').toString('base64');
    const body = { message, content: encoded, sha };

    const res = await fetch(`https://api.github.com/repos/${repo}/contents/${path}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) return Response.json({ error: data.message }, { status: res.status });

    return Response.json({ sha: data.content.sha });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}