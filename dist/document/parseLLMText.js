export function parseLLMText(text) {
    return text
        .split("\n")
        .filter((line) => line.includes("https://github.com/supersignal/going_on_hypersonic/blob/main/markdown/")) // 실제 경로로 수정
        .map((line) => parse({ text: line, link: extractLink(line) }));
}
function extractLink(line) {
    const start = line.indexOf("](");
    const end = line.indexOf(")", start);
    return line.substring(start + 2, end);
}
function parse(link) {
    const { text, link: url } = link;
    const title = extractTitle(text);
    const description = extractDescription(text);
    return {
        text,
        title,
        link: url,
        description,
    };
}
function extractTitle(text) {
    const start = text.indexOf("[") + 1;
    const end = text.indexOf("](", start);
    return text.substring(start, end).trim();
}
function extractDescription(text) {
    const start = text.indexOf("):") + 2;
    return text.substring(start).trim();
}
