const fadeEls = document.querySelectorAll("h1, h2, h3, p");

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("visible");
      // Optional: stop observing once visible
      observer.unobserve(entry.target);
    }
  });
}, {
  threshold: 0.1
});

fadeEls.forEach(el => observer.observe(el));