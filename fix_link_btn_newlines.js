const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
    });
}

walkDir('./src/components', (filePath) => {
    if (filePath.endsWith('.js') || filePath.endsWith('.jsx')) {
        let content = fs.readFileSync(filePath, 'utf8');
        let modified = false;

        // Match Link elements with link-btn class that don't have aria-label, handling newlines
        // Example: <Link \n href="X" \n className="link-btn"\n ></Link>
        const linkBtnRegex = /<Link[\s\n]+href=(["{`][^"}`]+["}`])[\s\n]+className="link-btn"[\s\n]*><\/Link>/g;
        if (linkBtnRegex.test(content)) {
            content = content.replace(linkBtnRegex, (match, href) => {
                return `<Link href=${href} className="link-btn" aria-label="View details"></Link>`;
            });
            modified = true;
        }

        if (modified) {
            fs.writeFileSync(filePath, content, 'utf8');
            console.log(`Modified ${filePath}`);
        }
    }
});
