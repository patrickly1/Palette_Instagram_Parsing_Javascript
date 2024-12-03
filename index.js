const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

function parseInstagramHtml(filePath, postType) {
    // Read the HTML file
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Load the content into Cheerio
    const $ = cheerio.load(content);

    // Extracting information
    const usernameMeta = $('meta[name="twitter:title"]').attr('content');
    const description = $('meta[name="description"]').attr('content');
    const ogDescription = $('meta[property="og:description"]').attr('content');
    const url = $('link[rel="alternate"][hreflang="x-default"]').attr('href');
    const category = $('title').text() || "Not Available";

    // Extract location directly
    let location = "Not Available";

    // Check if location is embedded in meta tags
    const locationMetaTags = [description, ogDescription];
    for (const metaTag of locationMetaTags) {
        if (metaTag && metaTag.includes('📍')) {
            location = metaTag.split('📍')[1].split('\n')[0].trim();
            break;
        }
    }

    // Extract username from twitter:title
    let username = "Not Available";
    if (usernameMeta && usernameMeta.includes("@")) {
        username = usernameMeta.split("@").pop().split(" ")[0];
    }

    // Clean and format
    return {
        Type: postType,
        Username: username,
        URL: url || "Not Available",
        Category: category.trim() || "Not Available",
        Description: description || "Not Available",
        OG_Description: ogDescription || "Not Available",
        Location: location
    };
}

// Folder containing the files
const folderPath = './Sample'; // Adjust the path as needed if not in the current directory

// File names and their respective post types
const files = {
    "reel.txt": "Reel",
    "carousel.txt": "Carousel",
    "portrait.txt": "Portrait",
    "square.txt": "Square"
};

const output = [];

// Parse each file
for (const [fileName, postType] of Object.entries(files)) {
    const filePath = path.join(folderPath, fileName);
    if (fs.existsSync(filePath)) {
        const parsedData = parseInstagramHtml(filePath, postType);
        output.push(parsedData);
    } else {
        console.log(`File not found: ${filePath}`);
    }
}

// Print formatted output
output.forEach(entry => {
    for (const [key, value] of Object.entries(entry)) {
        console.log(`  ${key}: ${value}`);
    }
});