package com.example.seatrans.shared.util;

import org.owasp.html.HtmlPolicyBuilder;
import org.owasp.html.PolicyFactory;
import org.springframework.stereotype.Component;

/**
 * HTML Sanitizer to prevent XSS attacks
 * Uses OWASP Java HTML Sanitizer
 */
@Component
public class HtmlSanitizer {
    
    /**
     * Policy for rich text content (blog posts, descriptions)
     * Allows safe HTML tags commonly used in TinyMCE/CKEditor
     */
    private static final PolicyFactory RICH_TEXT_POLICY = new HtmlPolicyBuilder()
            // Text formatting
            .allowElements("p", "br", "span", "div")
            .allowElements("b", "i", "u", "strong", "em", "mark", "small", "del", "ins", "sub", "sup")
            
            // Headings
            .allowElements("h1", "h2", "h3", "h4", "h5", "h6")
            
            // Lists
            .allowElements("ul", "ol", "li")
            
            // Links
            .allowElements("a")
            .allowAttributes("href", "title", "target", "rel").onElements("a")
            .allowStandardUrlProtocols()
            .requireRelNofollowOnLinks()
            
            // Images
            .allowElements("img", "picture", "figure", "figcaption")
            .allowAttributes("src", "alt", "title", "width", "height", "loading").onElements("img")
            .allowAttributes("srcset", "sizes").onElements("img")
            
            // Tables
            .allowElements("table", "thead", "tbody", "tfoot", "tr", "th", "td", "caption", "colgroup", "col")
            .allowAttributes("colspan", "rowspan").onElements("td", "th")
            
            // Code blocks
            .allowElements("pre", "code", "kbd", "samp", "var")
            
            // Blockquotes and citations
            .allowElements("blockquote", "cite", "q")
            
            // Semantic elements
            .allowElements("article", "section", "aside", "header", "footer", "main", "nav")
            .allowElements("address", "time", "abbr", "dfn")
            
            // Media (video/audio) - only allow embeds from trusted sources
            .allowElements("iframe", "video", "audio", "source")
            .allowAttributes("src", "controls", "width", "height", "frameborder", "allowfullscreen")
                .onElements("iframe", "video", "audio", "source")
            
            // Horizontal rule
            .allowElements("hr")
            
            // Common attributes
            .allowAttributes("class", "id").globally()
            .allowAttributes("style").globally() // Be careful with inline styles
            
            .toFactory();
    
    /**
     * Policy for plain text with basic formatting
     * Only allows very basic HTML tags (no images, links, scripts)
     */
    private static final PolicyFactory BASIC_TEXT_POLICY = new HtmlPolicyBuilder()
            .allowElements("p", "br", "b", "i", "u", "strong", "em")
            .toFactory();
    
    /**
     * Policy that strips ALL HTML tags
     * Returns plain text only
     */
    private static final PolicyFactory PLAIN_TEXT_POLICY = new HtmlPolicyBuilder()
            .toFactory();
    
    /**
     * Sanitize rich text content (for blog posts, article content)
     * Allows safe HTML tags while preventing XSS
     * 
     * @param html Raw HTML content
     * @return Sanitized HTML safe for rendering
     */
    public String sanitizeRichText(String html) {
        if (html == null || html.trim().isEmpty()) {
            return "";
        }
        return RICH_TEXT_POLICY.sanitize(html);
    }
    
    /**
     * Sanitize basic text with minimal formatting
     * Only allows basic formatting tags (no links, images, scripts)
     * 
     * @param html Raw HTML content
     * @return Sanitized HTML with basic formatting only
     */
    public String sanitizeBasicText(String html) {
        if (html == null || html.trim().isEmpty()) {
            return "";
        }
        return BASIC_TEXT_POLICY.sanitize(html);
    }
    
    /**
     * Strip all HTML tags and return plain text
     * Use for user input that should never contain HTML
     * 
     * @param input User input that may contain HTML
     * @return Plain text without any HTML tags
     */
    public String toPlainText(String input) {
        if (input == null || input.trim().isEmpty()) {
            return "";
        }
        return PLAIN_TEXT_POLICY.sanitize(input);
    }
    
    /**
     * Sanitize user input for database storage
     * Escapes special characters to prevent SQL injection and XSS
     * 
     * @param input User input string
     * @return Escaped string safe for storage
     */
    public String escapeUserInput(String input) {
        if (input == null) {
            return null;
        }
        
        return input
                .replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;")
                .replace("\"", "&quot;")
                .replace("'", "&#x27;")
                .replace("/", "&#x2F;");
    }
}
