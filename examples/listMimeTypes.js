const { getLatestUpdates, getItemDetail } = require("..");

async function main() {
  const res = await getLatestUpdates({ type: "Writing" });
  for (const update of res.updates) {
    console.log(`\n# ${update.title} (${update.detailUrl})`);
    const item = await getItemDetail(update.itemId);
    console.log(`mime: ${item.mimeType}`);
    if (item.content) {
      console.log(`length: ${item.content.text.length}`);
    }
  }
}

main();
