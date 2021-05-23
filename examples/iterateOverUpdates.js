const { iterateLatestUpdates } = require("..");

async function main() {
  for await (const { updates } of iterateLatestUpdates({ type: "Writing" })) {
    for (const update of updates) {
      console.log(update.title);
    }
  }
}

main();
