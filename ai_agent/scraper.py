import httpx
from bs4 import BeautifulSoup
from typing import Optional

async def scrape_url(url: str) -> Optional[str]:
    """Basic URL scraper using httpx and BeautifulSoup."""
    try:
        async with httpx.AsyncClient(timeout=10.0, follow_redirects=True) as client:
            headers = {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
            }
            resp = await client.get(url, headers=headers)
            resp.raise_for_status()
            
            soup = BeautifulSoup(resp.text, "html.parser")
            
            # Remove scripts, styles, etc.
            for s in soup(["script", "style", "meta", "link", "header", "footer", "nav"]):
                s.decompose()
            
            # Get text and clean it up
            text = soup.get_text(separator="\n", strip=True)
            return text[:5000] # Cap text at 5k chars for Gemini
            
    except Exception as e:
        print(f"Scraping error: {e}")
        return None

def extract_pdf_text(file_path: str) -> Optional[str]:
    """Extract text from a PDF file using pdfplumber."""
    try:
        import pdfplumber
        text = ""
        with pdfplumber.open(file_path) as pdf:
            for page in pdf.pages:
                text += page.extract_text() or ""
        return text[:5000]
    except Exception as e:
        print(f"PDF extraction error: {e}")
        return None
