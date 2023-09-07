const fs = require('fs');

// Read the generated HTML file
const htmlFilePath = 'font/vscode-font.html'; // Adjust the path to your generated HTML file
const htmlContent = fs.readFileSync(htmlFilePath, 'utf8');

let modifiedHtml = htmlContent.replace(
    '<h1>vscode-font</h1>',
    `<h1>vscode-font</h1> <div> <input type="text" id="searchInput" placeholder="Seach Icon"> </div>`
);

modifiedHtml = modifiedHtml.replace(
    '</body>',
    `<script>
    // JavaScript to handle the label filtering
    document.getElementById('searchInput').addEventListener('input', function () {
        const searchText = this.value.toLowerCase();
        const previews = document.querySelectorAll('.preview');

        previews.forEach(function (preview) {
            const label = preview.querySelector('.label');
            const labelText = label.textContent.toLowerCase();

            if (labelText.includes(searchText)) {
                preview.style.display = 'inline-block';
            } else {
                preview.style.display = 'none';
            }
        });
    });
</script>
</body>`
);

// Write the modified HTML file
fs.writeFileSync(htmlFilePath, modifiedHtml);
