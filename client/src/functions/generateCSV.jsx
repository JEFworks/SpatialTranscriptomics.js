const generateCSV = (table, fileName) => {
  const CSV = table.join("\n");
  const element = document.createElement("a");
  const file = new Blob([CSV], { type: "text/csv" });
  element.href = URL.createObjectURL(file);
  element.download = fileName;
  document.body.appendChild(element);
  element.click();
};

export default generateCSV;
