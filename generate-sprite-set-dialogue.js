// Cheerio will need installing: npm install cheerio
const fs = require("fs");
const path = require("path");
const cheerio = require("cheerio");
const readline = require("readline");

// Set whether you want to generate the standard sprite set or minified sprite set or both - note that the sprites are already minified, so it's mostly about line breaks. I am defaulting to generating just the version with line breaks - easier for new users.
const GENERATE_STANDARD = true;
// const GENERATE_MINIFIED = true;

// Set where you downloaded the Susty Icon sprite set to here. Note that styling does not carry over, so the only difference is whether you choose bold or solid versions.
const ICON_DIR = "/wherever/you/stored/Sustyicons-black-bold";
const OUTPUT_DIR = "/wherever/you/output/SVG-Output/";
const VIEWBOX = "0 0 128 128";

// Add the icons you want via command line - node, script name, the chosen filename to go into the output folder, and the icons you want separated by spaces.
const args = process.argv.slice(2);
if (args.length < 2) {
  console.error("Usage: node generate-sprite-set-dialogue.js <all-icons> <icon1> <icon2> ...");
  process.exit(1);
}

const SPRITE_NAME = args[0];
let ICON_NAMES = args.slice(1);

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const ask = q => new Promise(resolve => rl.question(q, a => resolve(a.trim())));
const minify = svg => svg.replace(/\n+/g, '').replace(/>\s+</g, '><').replace(/\s{2,}/g, ' ').trim();

async function iconNotFound(iconName) {
  while (true) {
    const choice = await ask(
      `💩 Oops, the "${iconName}" icon couldn't be found.\n` +
      `How do you wish to proceed?\n` +
      `  a) Quit and cancel the entire process\n` +
      `  b) Skip this icon and continue - generate the sprite sheet without it\n` +
      `  c) Fix the name - there's a typo or something\n` +
      `Make a choice: (a/b/c): `
    );

    switch (choice.toLowerCase()) {
      case 'a':
        console.log("Quitting and cancelling the process, as requested. No sprite sheet(s) generated.");
        rl.close();
        process.exit(0);

      case 'b':
        console.log(`Skipping "${iconName}" and continuing with the rest...`);
        return null;

      case 'c':
        while (true) {
          const fixedName = await ask("What's the correct name for that icon? ");
          const fixedPath = path.join(ICON_DIR, fixedName + ".svg");
          if (fs.existsSync(fixedPath)) {
            console.log(`✅ "${fixedName}" found. Continuing...`);
            return fixedName;
          } else {
            const retry = await ask(`Couldn't find "${fixedName}". Try again? (yes/no): `);
            if (retry.toLowerCase() !== 'yes') break;
          }
        }
        break;

      default:
        console.log("Sorry, that’s not a valid option. Please type 'a', 'b', or 'c'.");
    }
  }
}

async function generateSprite() {
  let symbolOutputs = "";
  let reusedIDCount = 1;
  let finalIcons = [];

  // Generate random 3-letter ID prefix - this is to massively reduce the risk of accidentally targeting an ID within an SVG that has repeated elements. See below...
  const idPrefix = Array.from({ length: 3 }, () =>
    String.fromCharCode(Math.random() < 0.5
      ? 65 + Math.floor(Math.random() * 26) // A-Z
      : 97 + Math.floor(Math.random() * 26) // a-z
    )
  ).join('');

  for (const iconName of ICON_NAMES) {
    const filePath = path.join(ICON_DIR, iconName + ".svg");

    if (!fs.existsSync(filePath)) {
      const corrected = await iconNotFound(iconName);
      if (corrected) finalIcons.push(corrected);
    } else {
      finalIcons.push(iconName);
    }
  }

  for (const iconName of finalIcons) {
    const filePath = path.join(ICON_DIR, iconName + ".svg");
    const content = fs.readFileSync(filePath, "utf8");
    const $ = cheerio.load(content, { xmlMode: true });
    const $svg = $("svg").first();

    // Remaps IDs in reused elements to avoid accidental reuse of the same ones. These will sometimes need targeting when formatting, so renamed using the random prefix generated above. 
    const idMap = new Map();
    $svg.find("[id]").each((_, el) => {
      const $el = $(el);
      const oldId = $el.attr("id");
      const newId = `${idPrefix}${reusedIDCount++}`;
      idMap.set(oldId, newId);
      $el.attr("id", newId);
    });

    // Update references to match remapped IDs.
    $svg.find("use").each((_, el) => {
      const $el = $(el);
      let href = $el.attr("href") || $el.attr("xlink:href");
      if (href?.startsWith("#")) {
        const newId = idMap.get(href.slice(1));
        if (newId) {
          $el.attr("href", `#${newId}`);
          $el.removeAttr("xlink:href");
        }
      }
    });

    const symbolContent = $svg.html();
    symbolOutputs += `<symbol id="${iconName}" viewBox="${VIEWBOX}">${symbolContent}</symbol>\n`;
  }

  const sprite = `<?xml version="1.0" encoding="UTF-8"?>\n<svg xmlns="http://www.w3.org/2000/svg">\n${symbolOutputs}</svg>`;

  const outputPath = path.join(OUTPUT_DIR, `${SPRITE_NAME}.svg`);
  const minOutput = outputPath.replace(/\.svg$/, "_min.svg");

  if (typeof GENERATE_STANDARD !== "undefined" && GENERATE_STANDARD) {
    fs.writeFileSync(outputPath, sprite);
    console.log(`✏️ Sprite sheet written to: file://${outputPath}`);
  }

  if (typeof GENERATE_MINIFIED !== "undefined" && GENERATE_MINIFIED) {
    fs.writeFileSync(minOutput, minify(sprite));
    console.log(`✏️ Minified sprite sheet written to: file://${minOutput}`);
  }

  console.log(`💡 Remember: Nothing will display without styling. Have a play with the Susty Icon CSS Playground at 📎https://codewordcreative.com/sustyicon-csss-playground/ to generate the right look.`);
  rl.close();
}

generateSprite();
