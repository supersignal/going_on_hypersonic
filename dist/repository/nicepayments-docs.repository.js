import { parseLLMText } from "../document/parseLLMText.js";
import { calculateBM25ScoresByKeywords, } from "../utils/calculateBM25.js";
import { NicePaymentsDocumentLoader } from "../document/nicepayments-document.loader.js";
import { MarkdownDocumentFetcher } from "../document/markdown-document.fetcher.js";
export class NicePaymentDocsRepository {
    documents;
    static async load(link = "https://github.com/supersignal/going_on_hypersonic/blob/main/llm/llms.txt") {
        // 로컬 파일 읽기
        const fs = await import('fs/promises');
        let llmText;
        try {
            llmText = await fs.readFile(link.replace('file://', ''), 'utf-8');
            console.log("[DEBUG] llms.txt 파일 정상 로드됨:", llmText.length, "bytes");
        }
        catch (error) {
            console.error("[DEBUG] llms.txt 파일 로드 실패:", error);
            throw new Error(`Failed to read LLM text file: ${error}`);
        }
        const rawDocs = parseLLMText(llmText);
        console.log("[DEBUG] parseLLMText 결과:", rawDocs.length, "개 문서");
        const loader = new NicePaymentsDocumentLoader(rawDocs, new MarkdownDocumentFetcher());
        await loader.load();
        console.log("[DEBUG] 문서 로딩 완료, 문서 개수:", loader.getDocuments().length);
        const documents = loader.getDocuments();
        return new NicePaymentDocsRepository(documents);
    }
    constructor(documents) {
        this.documents = documents;
    }
    async findDocumentsByKeyword(keywords, topN = 10) {
        // [디버그] 검색 키워드 입력값 출력
        console.log('[DEBUG][repository] findDocumentsByKeyword - 입력 키워드:', keywords);
        const result = await this.getDocumentsByKeywordForLLM(this.documents, keywords, topN);
        // [디버그] getDocumentsByKeywordForLLM 반환값 출력
        console.log('[DEBUG][repository] findDocumentsByKeyword - getDocumentsByKeywordForLLM 반환값:', result);
        if (!result || result.trim() === "") {
            console.log("[DEBUG] BM25 검색 결과 없음");
        }
        else {
            console.log("[DEBUG] BM25 검색 결과 있음");
        }
        return result;
    }
    findOneById(id) {
        return this.documents[id];
    }
    async getDocumentsByKeywordForLLM(documents, keywords, topN = 10) {
        // [디버그] BM25 점수 계산 전 입력값 출력
        console.log('[DEBUG][repository] getDocumentsByKeywordForLLM - 입력 keywords:', keywords);
        const results = calculateBM25ScoresByKeywords(keywords.join("|"), documents);
        // [디버그] BM25 점수 결과 상위 3개 출력
        console.log('[DEBUG][repository] getDocumentsByKeywordForLLM - BM25 결과:', results.length, results.slice(0, 3));
        const docs = results
            .slice(0, topN)
            .map((item) => this.findChunkByBM25Result(item))
            .filter((item) => item !== undefined)
            .map((items) => this.normalizeChunks(items));
        // [디버그] 정제된 청크 결과 출력
        console.log('[DEBUG][repository] getDocumentsByKeywordForLLM - 정제된 청크:', docs);
        return docs.join("\n\n");
    }
    findChunkByBM25Result(item) {
        const document = this.findOneById(item.id);
        return document.getChunkWithWindow(item.chunkId, 1);
    }
    normalizeChunk(chunk) {
        return `## 원본문서 제목 : ${chunk.originTitle}\n* 원본문서 ID : ${chunk.id}\n\n${chunk.text}`;
    }
    normalizeChunks(chunks) {
        // [디버그] normalizeChunks 입력값 출력
        console.log('[DEBUG][repository] normalizeChunks - 입력 청크:', chunks);
        return `## 원본문서 제목 : ${chunks[0].originTitle}\n* 원본문서 ID : ${chunks[0].id}\n\n${chunks.map((chunk) => chunk.text).join("\n\n")}`;
    }
}
