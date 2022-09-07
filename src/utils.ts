type Content = {
  type: string;
  text: string;
};

export const getExcerpt = (content: Content[]) => {
  const text = content.find(
    (content: { type: string; text: string }) =>
      content.type === "paragraph"
  )?.text ?? "";

  return text;
}

export const dateFormatter = new Intl.DateTimeFormat("en-US", {
  day: "2-digit",
  month: "long",
  year: "numeric",
});

export const getPreview = (content: Content[], from = 0, end = 3) => {
  return content.splice(from, end);
}