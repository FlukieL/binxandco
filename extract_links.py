
import re

with open('x:/Git/binxandco/oldsite/binxandco.co.uk/index.htm', 'r', encoding='utf-8') as f:
    content = f.read()

clients = [
    "Wing Fest", "Opheem", "Behind", "The Bowls Club London", "Aktar At Home",
    "Heaneys", "Hackney Bridge", "Longboys", "OAKBERRY", "Vinegar Yard",
    "Polo 24 Hour Bar", "KERB", "Seoul Bird", "Emilia's Crafted Pasta",
    "Balans", "Junsei", "OshPaz",
    "Aktar Islam", "Graham Hornigold", "Andy Beynon", "Judy Joo", "Tommy Heaney"
]

results = {}

# Normalize content to help with finding
# content_lower = content.lower()

for client in clients:
    # Find the client name
    # We will look for the client name in the content
    # Then find the nearest preceding <a href="...">
    
    indices = [m.start() for m in re.finditer(re.escape(client), content)]
    
    found_link = None
    for idx in indices:
        # Search backwards for <a 
        # Limit search to 500 chars back
        start_search = max(0, idx - 500)
        chunk = content[start_search:idx]
        
        # Find the last <a in this chunk
        last_a = chunk.rfind('<a ')
        if last_a != -1:
            # Check if this <a> tag is closed after the client name
            # or if the client name is inside the <a> tag
            
            # Get the full tag start
            tag_start_idx = start_search + last_a
            
            # Find the closing </a> after the client name
            close_a = content.find('</a>', idx)
            
            if close_a != -1:
                # Check if there are other <a> tags in between (nested or separate)
                # If there is another <a before the closing </a> and after the tag_start, it might be wrong.
                # But HTML doesn't allow nested <a>.
                
                # Extract the href
                tag_content = content[tag_start_idx:idx+len(client)+20] # grab a bit more
                href_match = re.search(r'href=["\'](.*?)["\']', tag_content)
                if href_match:
                    found_link = href_match.group(1)
                    break
    
    if found_link:
        results[client] = found_link
    else:
        results[client] = "#" # Default to # if not found

with open('x:/Git/binxandco/links.txt', 'w', encoding='utf-8') as f:
    for client, link in results.items():
        f.write(f"{client}: {link}\n")
