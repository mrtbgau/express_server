const ps = document.querySelectorAll(".datas-links > ul > li > p");
const sublists = document.querySelectorAll(".datas-links > ul > li > ul");
const itemsSublists = document.querySelectorAll(
  ".datas-links > ul > li > ul > li"
);

ps.forEach((p, index) =>
  p.addEventListener("click", () => {
    sublists.forEach(
      (list, i) =>
        (list.style.display =
          index === i && list.style.display !== "block" ? "block" : "none")
    );
  })
);

document.addEventListener("click", (event) => {
  const target = event.target;
  if (![...ps, ...itemsSublists].some((element) => element.contains(target))) {
    sublists.forEach((list) => (list.style.display = "none"));
  }
});
