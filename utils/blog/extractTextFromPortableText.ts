export const extractTextFromPortableText = (body: any[]): string => {
    return body
      .map((block) => {
        if (block._type === "block" && Array.isArray(block.children)) {
          return block.children.map((child: any) => child.text).join(" ");
        }
        return "";
      })
      .join(" ")
      .trim();
  };
  