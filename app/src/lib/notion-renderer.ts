import type {
  BlockObjectResponse,
  RichTextItemResponse,
} from "@notionhq/client/build/src/api-endpoints";

function renderRichText(richText: RichTextItemResponse[]): string {
  return richText
    .map((t) => {
      let text = t.plain_text;
      if (t.annotations.bold) text = `<strong>${text}</strong>`;
      if (t.annotations.italic) text = `<em>${text}</em>`;
      if (t.annotations.strikethrough) text = `<del>${text}</del>`;
      if (t.annotations.code)
        text = `<code class="bg-gray-100 px-1 rounded text-sm">${text}</code>`;
      if (t.href) text = `<a href="${t.href}" class="text-blue-600 underline">${text}</a>`;
      return text;
    })
    .join("");
}

export function renderBlocks(blocks: BlockObjectResponse[]): string {
  const html: string[] = [];
  let listType: "ul" | "ol" | null = null;

  function closeList() {
    if (listType) {
      html.push(listType === "ul" ? "</ul>" : "</ol>");
      listType = null;
    }
  }

  for (const block of blocks) {
    const type = block.type;

    // Handle list grouping
    if (type !== "bulleted_list_item" && type !== "numbered_list_item") {
      closeList();
    }

    switch (type) {
      case "paragraph": {
        const text = renderRichText(block.paragraph.rich_text);
        if (text) {
          html.push(`<p class="mb-2">${text}</p>`);
        } else {
          html.push(`<div class="h-2"></div>`);
        }
        break;
      }

      case "heading_1": {
        const text = renderRichText(block.heading_1.rich_text);
        html.push(
          `<h2 class="text-xl font-bold mt-6 mb-3 pb-1 border-b border-gray-300">${text}</h2>`
        );
        break;
      }

      case "heading_2": {
        const text = renderRichText(block.heading_2.rich_text);
        html.push(
          `<h3 class="text-lg font-bold mt-5 mb-2">${text}</h3>`
        );
        break;
      }

      case "heading_3": {
        const text = renderRichText(block.heading_3.rich_text);
        html.push(
          `<h4 class="text-base font-semibold mt-4 mb-1">${text}</h4>`
        );
        break;
      }

      case "bulleted_list_item": {
        if (listType !== "ul") {
          closeList();
          html.push(`<ul class="list-disc ml-6 mb-2">`);
          listType = "ul";
        }
        const text = renderRichText(block.bulleted_list_item.rich_text);
        html.push(`<li class="mb-0.5">${text}</li>`);
        break;
      }

      case "numbered_list_item": {
        if (listType !== "ol") {
          closeList();
          html.push(`<ol class="list-decimal ml-6 mb-2">`);
          listType = "ol";
        }
        const text = renderRichText(block.numbered_list_item.rich_text);
        html.push(`<li class="mb-0.5">${text}</li>`);
        break;
      }

      case "divider": {
        html.push(`<hr class="my-4 border-gray-300" />`);
        break;
      }

      case "quote": {
        const text = renderRichText(block.quote.rich_text);
        html.push(
          `<blockquote class="border-l-4 border-gray-300 pl-4 my-3 text-gray-600">${text}</blockquote>`
        );
        break;
      }

      case "table": {
        html.push(`<div class="overflow-x-auto my-3"><table class="w-full border-collapse border border-gray-300 text-sm">`);
        break;
      }

      case "table_row": {
        html.push(`<tr>`);
        for (const cell of block.table_row.cells) {
          const text = renderRichText(cell);
          html.push(`<td class="border border-gray-300 px-3 py-1.5">${text}</td>`);
        }
        html.push(`</tr>`);
        break;
      }

      default:
        break;
    }
  }

  closeList();

  return html.join("\n");
}
