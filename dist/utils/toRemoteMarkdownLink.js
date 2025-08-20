export function toRemoteMarkdownLink(link) {
    // HTTP나 해시 링크는 무시
    if (link.startsWith("http") || link.startsWith("#")) {
        return;
    }
    // 이미 절대 경로인 경우 그대로 반환
    if (link.startsWith("https://github.com/supersignal/going_on_hypersonic/blob/main/markdown/")) {
        return link.endsWith(".markdown") ? link : `${link}.markdown`;
    }
    // 상대 경로인 경우 절대 경로로 변환
    const basePath = "https://github.com/supersignal/going_on_hypersonic/blob/main/markdown/";
    const fullPath = `${basePath}${link.startsWith("/") ? link : `/${link}`}`;
    return fullPath.endsWith(".markdown") ? fullPath : `${fullPath}.markdown`;
}
