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

        // Bookmark button
        const oldBookmark = /<button(\s+type="button")?\s+className="bookmark-save">/g;
        if (oldBookmark.test(content)) {
            content = content.replace(oldBookmark, '<button$1 className="bookmark-save" aria-label="Save bookmark">');
            modified = true;
        }

        // Category button
        const oldCategory = /<button(\s+type="button")?\s+className="category">/g;
        if (oldCategory.test(content)) {
            content = content.replace(oldCategory, '<button$1 className="category" aria-label="Category">');
            modified = true;
        }

        // Link button empty
        const oldLinkBtn = /<Link\s+href="([^"]+)"\s+className="link-btn"><\/Link>/g;
        if (oldLinkBtn.test(content)) {
            content = content.replace(oldLinkBtn, (match, href) => {
                // If it's already an aria-label, skip, but our regex doesn't match if there are other props.
                return `<Link href="${href}" className="link-btn" aria-label="View details"></Link>`;
            });
            modified = true;
        }
        
        const oldLinkBtnDyn = /<Link\s+href=\{([^}]+)\}\s+className="link-btn"><\/Link>/g;
        if (oldLinkBtnDyn.test(content)) {
            content = content.replace(oldLinkBtnDyn, (match, href) => {
                return `<Link href={${href}} className="link-btn" aria-label="View details"></Link>`;
            });
            modified = true;
        }

        if (modified) {
            fs.writeFileSync(filePath, content, 'utf8');
            console.log(`Modified ${filePath}`);
        }
    }
});
