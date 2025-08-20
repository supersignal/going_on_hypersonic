export function parseLLMText(text: string): RawDocs[] {
  return text
    .split("\n")
    .filter((line) => line.includes("/Users/jiwon/Desktop/md/")) // 실제 경로로 수정
    .map((line) => parse({ text: line, link: extractLink(line) }));
}

function extractLink(line: string) {
  const start = line.indexOf("](");
  const end = line.indexOf(")", start);
  return line.substring(start + 2, end);
}

export type RawDocs = {
  text: string;
  title: string;
  link: string;
  description: string;
};

function parse(link: { text: string; link: string }): RawDocs {
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

function extractTitle(text: string): string {
  const start = text.indexOf("[") + 1;
  const end = text.indexOf("](", start);
  return text.substring(start, end).trim();
}

function extractDescription(text: string): string {
  const start = text.indexOf("):") + 2;
  return text.substring(start).trim();
}

