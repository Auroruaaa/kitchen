document.addEventListener("DOMContentLoaded", () => {
    const addRecipeButton = document.querySelector(".add-recipe");
    const recipeFormModal = document.getElementById("recipe-form-modal");
    const closeModalButton = document.querySelector(".close");
    const recipeForm = document.getElementById("recipe-form");
    let editingRecipeDiv = null;

    loadRecipesFromLocalStorage();

    addRecipeButton.addEventListener("click", () => {
        recipeFormModal.style.display = "block";
        editingRecipeDiv = null;  // Reset editing state
    });

    closeModalButton.addEventListener("click", () => {
        recipeFormModal.style.display = "none";
    });

    window.addEventListener("click", (event) => {
        if (event.target === recipeFormModal) {
            recipeFormModal.style.display = "none";
        }
    });

    recipeForm.addEventListener("submit", (event) => {
        event.preventDefault();
        const title = document.getElementById("recipe-title").value;
        const ingredients = document.getElementById("recipe-ingredients").value;
        const steps = document.getElementById("recipe-steps").value;
        
        if (editingRecipeDiv) {
            updateRecipe(editingRecipeDiv, title, ingredients, steps);
        } else {
            addRecipe(title, ingredients, steps);
        }

        recipeFormModal.style.display = "none";
        recipeForm.reset();
    });

    function addRecipe(title, ingredients, steps, grades = [], comments = []) {
        const recipeDiv = document.createElement("div");
        recipeDiv.classList.add("recipe");
        recipeDiv.innerHTML = `
            <h3>${title}</h3>
            <p><strong>Ingredients:</strong> ${ingredients}</p>
            <p><strong>Steps:</strong> ${steps}</p>
            <button class="edit-recipe">Edit</button>
            <button class="delete-recipe">Delete</button>
            <div class="grade-section">
                <input type="number" class="grade-input" min="0" max="10" placeholder="0-10">
                <button class="submit-grade">Grade</button>
                <span class="grade-average">Average: ${calculateAverage(grades)} (${grades.length})</span>
            </div>
            <div class="comments-section">
                <textarea class="comment-input" placeholder="Add a comment..."></textarea>
                <button class="add-comment">Add Comment</button>
                <div class="comments">${comments.map(comment => createCommentHTML(comment)).join('')}</div>
            </div>
        `;
        document.getElementById("recipes-app").appendChild(recipeDiv);

        recipeDiv.grades = grades;
        recipeDiv.comments = comments;

        recipeDiv.querySelector(".edit-recipe").addEventListener("click", () => {
            editRecipe(recipeDiv, title, ingredients, steps);
        });

        recipeDiv.querySelector(".delete-recipe").addEventListener("click", () => {
            deleteRecipe(recipeDiv);
        });

        const submitGradeButton = recipeDiv.querySelector(".submit-grade");
        submitGradeButton.addEventListener("click", () => {
            submitGrade(recipeDiv);
        });

        const addCommentButton = recipeDiv.querySelector(".add-comment");
        addCommentButton.addEventListener("click", () => {
            addComment(recipeDiv);
        });

        saveRecipesToLocalStorage();
    }

    function updateRecipe(recipeDiv, title, ingredients, steps) {
        recipeDiv.querySelector("h3").innerText = title;
        recipeDiv.querySelector("p:nth-child(2)").innerText = `Ingredients: ${ingredients}`;
        recipeDiv.querySelector("p:nth-child(3)").innerText = `Steps: ${steps}`;
        saveRecipesToLocalStorage();
    }

    function editRecipe(recipeDiv, title, ingredients, steps) {
        document.getElementById("recipe-title").value = title;
        document.getElementById("recipe-ingredients").value = ingredients;
        document.getElementById("recipe-steps").value = steps;
        recipeFormModal.style.display = "block";
        editingRecipeDiv = recipeDiv;  // Set editing state
    }

    function deleteRecipe(recipeDiv) {
        recipeDiv.remove();
        saveRecipesToLocalStorage();
    }

    function submitGrade(recipeDiv) {
        const gradeInput = recipeDiv.querySelector(".grade-input");
        const gradeValue = parseFloat(gradeInput.value);
        const gradeAverageSpan = recipeDiv.querySelector(".grade-average");

        if (gradeValue >= 0 && gradeValue <= 10) {
            const grades = recipeDiv.grades || [];
            grades.push(gradeValue);
            recipeDiv.grades = grades;
            const average = calculateAverage(grades);
            gradeAverageSpan.innerText = `Average: ${average} (${grades.length})`;
            gradeInput.value = "";
            saveRecipesToLocalStorage();
        } else {
            alert("Please enter a valid grade between 1 and 10.");
        }
    }

    function addComment(recipeDiv) {
        const commentInput = recipeDiv.querySelector(".comment-input");
        const commentText = commentInput.value;
        if (commentText) {
            const comment = { text: commentText };
            const comments = recipeDiv.comments || [];
            comments.push(comment);
            recipeDiv.comments = comments;
            const commentDiv = createCommentElement(comment);
            recipeDiv.querySelector(".comments").appendChild(commentDiv);
            commentInput.value = "";
            saveRecipesToLocalStorage();
        }
    }

    function createCommentElement(comment) {
        const commentDiv = document.createElement("div");
        commentDiv.classList.add("comment");
        commentDiv.innerHTML = `
            <p>${comment.text}</p>
            <button class="edit-comment">Edit</button>
            <button class="delete-comment">Delete</button>
        `;
        commentDiv.querySelector(".edit-comment").addEventListener("click", () => {
            editComment(commentDiv, comment);
        });
        commentDiv.querySelector(".delete-comment").addEventListener("click", () => {
            deleteComment(commentDiv, comment);
        });
        return commentDiv;
    }

    function createCommentHTML(comment) {
        return `
            <div class="comment">
                <p>${comment.text}</p>
                <button class="edit-comment">Edit</button>
                <button class="delete-comment">Delete</button>
            </div>
        `;
    }

    function editComment(commentDiv, comment) {
        const newCommentText = prompt("Edit your comment:", comment.text);
        if (newCommentText !== null) {
            comment.text = newCommentText;
            commentDiv.querySelector("p").innerText = newCommentText;
            saveRecipesToLocalStorage();
        }
    }

    function deleteComment(commentDiv, comment) {
        const recipeDiv = commentDiv.closest(".recipe");
        recipeDiv.comments = recipeDiv.comments.filter(c => c !== comment);
        commentDiv.remove();
        saveRecipesToLocalStorage();
    }

    function calculateAverage(grades) {
        if (grades.length === 0) return 0;
        const total = grades.reduce((acc, grade) => acc + grade, 0);
        return (total / grades.length).toFixed(1);
    }

    function saveRecipesToLocalStorage() {
        const recipes = [];
        document.querySelectorAll(".recipe").forEach(recipeDiv => {
            const title = recipeDiv.querySelector("h3").innerText;
            const ingredients = recipeDiv.querySelector("p:nth-child(2)").innerText.replace("Ingredients: ", "");
            const steps = recipeDiv.querySelector("p:nth-child(3)").innerText.replace("Steps: ", "");
            const grades = recipeDiv.grades || [];
            const comments = recipeDiv.comments || [];
            recipes.push({ title, ingredients, steps, grades, comments });
        });
        localStorage.setItem("recipes", JSON.stringify(recipes));
    }

    function loadRecipesFromLocalStorage() {
        const recipes = JSON.parse(localStorage.getItem("recipes")) || [];
        recipes.forEach(recipe => {
            addRecipe(recipe.title, recipe.ingredients, recipe.steps, recipe.grades, recipe.comments);
        });
    }
});
