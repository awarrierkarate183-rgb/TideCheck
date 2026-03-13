import demoData from '../../../data/demo-zips.json';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const zip = searchParams.get('zip');

  // Find demo data by ZIP
  const result = demoData.find(item => item.zip === zip);

  if (result) {
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } else {
    // Fallback: return first demo ZIP
    return new Response(JSON.stringify(demoData[0]), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}