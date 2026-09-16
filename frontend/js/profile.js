document.addEventListener("DOMContentLoaded", () => {
  const profileImage = document.getElementById("profileImage");
  const profilePhoto = document.getElementById("profilePhoto");
  const profileName = document.getElementById("profileName");

  if (!profileImage || !profilePhoto || !profileName) {
    return;
  }

  // Load saved profile
  const savedName = localStorage.getItem("profileName");
  const savedPhoto = localStorage.getItem("profilePhoto");

  if (savedName) {
    profileName.value = savedName;
  }

  if (savedPhoto) {
    profileImage.src = savedPhoto;
  }

  // Save name
  profileName.addEventListener("input", () => {
    localStorage.setItem("profileName", profileName.value);
  });

  // Upload profile photo
  profilePhoto.addEventListener("change", () => {
    const file = profilePhoto.files[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      alert("Please select an image.");
      return;
    }

    const reader = new FileReader();

    reader.onload = (event) => {
      profileImage.src = event.target.result;
      localStorage.setItem("profilePhoto", event.target.result);
    };

    reader.readAsDataURL(file);
  });
});