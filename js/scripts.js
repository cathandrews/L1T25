$(document).ready(function () {
  // Initialize the saved and liked items arrays
  let savedItems = JSON.parse(localStorage.getItem("savedItems")) || [];
  let likedItems = JSON.parse(localStorage.getItem("likedItems")) || [];
  let animationInterval;
  let isAnimating = true;
  let currentSlideIndex = 0;

  // Function to save an item
  function saveItem(item, type) {
    const itemExists =
      type === "save"
        ? savedItems.some(
            (savedItem) =>
              savedItem.id === item.id &&
              savedItem.page === item.page &&
              savedItem.step === item.step
          )
        : likedItems.some(
            (likedItem) =>
              likedItem.id === item.id &&
              likedItem.page === item.page &&
              likedItem.step === item.step
          );

    if (!itemExists) {
      if (type === "save") {
        savedItems.push(item);
        localStorage.setItem("savedItems", JSON.stringify(savedItems));
        alert(
          `Item saved! You have ${savedItems.length} items in your "Save for Later" folder.`
        );
      } else {
        likedItems.push(item);
        localStorage.setItem("likedItems", JSON.stringify(likedItems));
        alert(
          `Item liked! You have ${likedItems.length} items in your "Liked Items" folder.`
        );
      }
    } else {
      if (type === "save") {
        alert("This item is already saved.");
      } else {
        alert("This item is already liked.");
      }
    }
  }

  // Add event listeners to save and like buttons using event delegation
  $(document).on("click", ".save-btn, .like-btn", function () {
    const item = $(this).closest(".image-item, .panel");
    const itemHtml = item.html();
    const itemId = item.attr("data-id");
    const step = item.attr("id");
    const type = $(this).hasClass("save-btn") ? "save" : "like";
    const page = window.location.pathname.includes("succulents.html")
      ? "succulent"
      : "propagation";
    saveItem({ id: itemId, html: itemHtml, page, step }, type);
  });

  // Display saved and liked items on the "Save for Later" page
  if (window.location.pathname.includes("saveforlater.html")) {
    const succulentTypesLikedGrid = $("#succulent-types-liked-grid");
    const succulentTypesSavedGrid = $("#succulent-types-saved-grid");
    const propagationTipsLikedGrid = $("#propagation-tips-liked-grid");
    const propagationTipsSavedGrid = $("#propagation-tips-saved-grid");

    // Clear existing items in the grids
    succulentTypesLikedGrid.empty();
    succulentTypesSavedGrid.empty();
    propagationTipsLikedGrid.empty();
    propagationTipsSavedGrid.empty();

    // Debugging: Log items retrieved from localStorage
    console.log("Initial Liked Items:", likedItems);
    console.log("Initial Saved Items:", savedItems);

    likedItems.forEach((item) => {
      const itemElement = $(
        `<div class="image-item" data-id="${item.id}" id="${item.step}">${item.html}<div class="button-container"><i class="fa-regular fa-trash-can remove-btn"></i></div></div>`
      );
      if (item.page === "succulent") {
        succulentTypesLikedGrid.append(itemElement);
      } else {
        propagationTipsLikedGrid.append(itemElement);
      }
    });

    savedItems.forEach((item) => {
      const itemElement = $(
        `<div class="image-item" data-id="${item.id}" id="${item.step}">${item.html}<div class="button-container"><i class="fa-regular fa-trash-can remove-btn"></i></div></div>`
      );
      if (item.page === "succulent") {
        succulentTypesSavedGrid.append(itemElement);
      } else {
        propagationTipsSavedGrid.append(itemElement);
      }
    });

    // Add event listener to remove buttons using event delegation
    $(document).on("click", ".remove-btn", function () {
      const itemId = $(this).closest(".image-item").attr("data-id");
      const step = $(this).closest(".image-item").attr("id"); 
      const type = $(this)
        .closest(".image-item")
        .parent()
        .attr("id")
        .includes("liked")
        ? "like"
        : "save";

      // Log the item being removed
      console.log(
        `Attempting to remove item with ID: ${itemId} and Step: ${step}`
      );

      if (type === "save") {
        console.log(`Before removal - Saved Items:`, savedItems);
        savedItems = savedItems.filter(
          (item) => item.id !== itemId || item.step !== step
        );
        console.log(`After removal - Saved Items:`, savedItems);
        localStorage.setItem("savedItems", JSON.stringify(savedItems));
      } else {
        console.log(`Before removal - Liked Items:`, likedItems);
        likedItems = likedItems.filter(
          (item) => item.id !== itemId || item.step !== step
        );
        console.log(`After removal - Liked Items:`, likedItems);
        localStorage.setItem("likedItems", JSON.stringify(likedItems));
      }

      // Remove the item from the DOM
      $(this).closest(".image-item").remove();
      alert(`Item removed permanently!`);
    });
  }

  // Add event listener to the "Save for Later" button in the footer
  $("#save-for-later-btn").on("click", function (event) {
    window.location.href = "saveforlater.html";
  });

  // Handle comment form submission
  $("#comment-form").on("submit", function (event) {
    event.preventDefault();
    const name = $("#name").val();
    const email = $("#email").val();
    const phone = $("#phone").val();
    const message = $("#message").val();
    const contactMethod = $('input[name="contact-method"]:checked').val();

    const commentHtml = `
      <div class="comment">
        <h4>${name}</h4>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone}</p>
        <p><strong>Preferred Contact Method:</strong> ${contactMethod}</p>
        <p>${message}</p>
      </div>
    `;

    $("#comments-container").append(commentHtml);
    $("#comment-form")[0].reset();
  });

  // Handle hide button click
  $(document).on("click", ".hide-btn", function () {
    const item = $(this).closest(".image-item");
    item.fadeOut();
  });

  // Handle see all button click
  $("#see-all-btn").on("click", function () {
    $(".image-item").fadeIn();
  });

  // Handle "Show All" button click
  $("#show-all-btn").on("click", function () {
    $(".image-item").fadeIn();
  });

  // Handle "Pause Animation" button click
  if (window.location.pathname.includes("succulents.html")) {
    $("#stop-animation-btn").on("click", function () {
      if (isAnimating) {
        // Stop the animation
        isAnimating = false;
        clearInterval(animationInterval);
        $(this).text("Start Animation");
      } else {
        // Start the animation
        isAnimating = true;
        animationInterval = setInterval(animateRows, 5000);
        $(this).text("Pause Animation");
      }
    });

    // Function to perform the animation
    function animateRows() {
      if (!isAnimating) return;

      const firstRow = $(".image-item:visible").slice(0, 4);
      firstRow.fadeOut(1000, function () {
        firstRow.appendTo(".image-grid").fadeIn(1000);
      });
    }

    // Start the animation immediately
    animationInterval = setInterval(animateRows, 5000);
  }

  // Slideshow functionality
  $("#start-slideshow-btn").on("click", function () {
    if (isAnimating) {
      // Stop the slideshow
      isAnimating = false;
      clearInterval(animationInterval);
      $("#slideshow-container").empty().removeClass("active-slide");
      $("#propagation-steps").fadeIn();
      $("#slide-controls").remove();
      $("body").removeClass("slideshow-active");
      $(this).text("View as a Slide Show");
    } else {
      // Start the slideshow
      isAnimating = true;
      $("#propagation-steps").fadeOut();
      $(".panel").clone().appendTo("#slideshow-container").fadeOut();
      currentSlideIndex = 0;
      showSlide(currentSlideIndex);
      animationInterval = setInterval(nextSlide, 6000);
      $(this).text("Stop Slide Show");

      // Add slide controls
      $("#slideshow-container").append(`
        <div id="slide-controls">
          <button id="prev-slide-btn">&#10094;</button>
          <button id="next-slide-btn">&#10095;</button>
        </div>
      `);

      // Add event listeners to slide controls
      $("#prev-slide-btn").on("click", prevSlide);
      $("#next-slide-btn").on("click", nextSlide);

      $("body").addClass("slideshow-active");
    }
  });

  function showSlide(index) {
    $("#slideshow-container .panel").fadeOut().removeClass("active-slide");
    $("#slideshow-container .panel")
      .eq(index)
      .fadeIn()
      .addClass("active-slide");
  }

  function nextSlide() {
    currentSlideIndex =
      (currentSlideIndex + 1) % $("#slideshow-container .panel").length;
    showSlide(currentSlideIndex);
  }

  function prevSlide() {
    currentSlideIndex =
      (currentSlideIndex - 1 + $("#slideshow-container .panel").length) %
      $("#slideshow-container .panel").length;
    showSlide(currentSlideIndex);
  }
});
