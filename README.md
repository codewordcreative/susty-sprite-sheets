# Susty Sprite Sheets: Tools for use with the Susty Icons set
A work in progress. A GUI will probably follow later. For now, here's a CLI tool with a dialogue tree to help people resolve any typo issues.

## Usage notes
Please read the comments in the code itself. Basically, add your constants (directories) to the file, and decide if you want minified or standard output or both. Then to use it you just write `node generate-sprite-set-dialogue.js filename icon icon icon` - where filename is the name for your SVG sprite set, and the icons are the ones you want to include.

## Important links
[Susty Icon Set Previews](https://codewordcreative.github.io/susty-icons/preview-variants.html)
This page provides a convenient preview of the sets and a link to a ZIP file. Given that the sprite generator strips all styling, though, all outline styles are ultimately identical. It also contains instructions on how to use the SVG sprite set.

[Susty Icon CSS Playground](https://codewordcreative.github.io/susty-icons/sustyicon-css-playground.html)
Use this to find the names of the icons you want to use at a glance.
Also use it to experiment and find the right CSS styling for your use case. You can copy and paste from there into your stylesheet.

[Susty Icon Github](https://github.com/codewordcreative/susty-icons)
Here you can find the whole Susty Icons Github.

## Dependencies
Uses cheerio.
Uses the Susty Icons set.

## Warning
Sometimes icons that have reused parts (for efficiency) will behave unexpectedly when formatting is applied. Identify the respective ID and target that, additionally, as needed. Overlap between these IDs and others is unlikely due to 3-letter prefix randomisation.

## Other icon sets
Not designed to work with other sets - that'd require a fair bit of cleaning and harmonising. Others are welcome to use this code as a basis, just please credit for any inspiration provided. You may be able to make it work with other sets with a consistent viewport and with extraneous data already stripped.
