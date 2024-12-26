const fromText = document.querySelector(".from-text");
const toText = document.querySelector(".to-text");
const exchangeIcon = document.querySelector(".exchange");
const selectTag = document.querySelectorAll("select");
const icons = document.querySelectorAll(".row i");
const translateBtn = document.querySelector("button");

// Заполнение селектов языками
selectTag.forEach((tag, id) => {
    for (let country_code in countries) {
        let selected = id == 0 ? country_code == "ru-RU" ? "selected" : "" : country_code == "en-GB" ? "selected" : "";
        let option = `<option ${selected} value="${country_code}">${countries[country_code]}</option>`;
        tag.insertAdjacentHTML("beforeend", option);
    }
});

exchangeIcon.addEventListener("click", () => {
    let tempText = fromText.value,
        tempLang = selectTag[0].value;
    fromText.value = toText.value;
    toText.value = tempText;
    selectTag[0].value = selectTag[1].value;
    selectTag[1].value = tempLang;
});

// Очистка перевода при отсутствии текста
fromText.addEventListener("keyup", () => {
    if (!fromText.value) {
        toText.value = "";
    }
});

// Функция для перевода текста
function translateText(text, translateFrom, translateTo) {
    const chunkSize = 500;
    let chunks = [];

    // Разделяем текст на части
    for (let i = 0; i < text.length; i += chunkSize) {
        chunks.push(text.slice(i, i + chunkSize));
    }

    // Переводим каждую часть
    Promise.all(chunks.map(chunk => {
        let apiUrl = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(chunk)}&langpair=${translateFrom}|${translateTo}`;
        return fetch(apiUrl).then(res => res.json());
    })).then(results => {
        // Объединяем переведенные части
        let translatedText = results.map(result => result.responseData.translatedText).join('');
        toText.value = translatedText;
    }).catch(error => {
        console.error('Ошибка перевода:', error);
        toText.value = "Ошибка перевода.";
    });
}

// Перевод текста
translateBtn.addEventListener("click", () => {
    let text = fromText.value.trim(),
        translateFrom = selectTag[0].value,
        translateTo = selectTag[1].value;
    if (!text) return;
    toText.setAttribute("placeholder", "Translating...");
    translateText(text, translateFrom, translateTo);
});

// Копирование текста и воспроизведение
icons.forEach(icon => {
    icon.addEventListener("click", ({ target }) => {
        if (target.classList.contains("fa-copy")) {
            // Копируем текст в зависимости от нажатой иконки
            if (target.id == "from") {
                navigator.clipboard.writeText(fromText.value).then(() => {
                    alert("Текст скопирован из поля 'От'");
                }).catch(err => {
                    console.error('Ошибка копирования: ', err);
                });
            } else {
                navigator.clipboard.writeText(toText.value).then(() => {
                    alert("Текст скопирован из поля 'На'");
                }).catch(err => {
                    console.error('Ошибка копирования: ', err);
                });
            }
        } else {
            // Воспроизведение текста
            let utterance;
            if (target.id == "from") {
                utterance = new SpeechSynthesisUtterance(fromText.value);
                utterance.lang = selectTag[0].value;
            } else {
                utterance = new SpeechSynthesisUtterance(toText.value);
                utterance.lang = selectTag[1].value;
            }
            speechSynthesis.speak(utterance);
        }
    });
});

// Отображение/скрытие выпадающего списка
selectTag.forEach(selector => {
    selector.addEventListener('click', (event) => {
        const dropdown = event.target.nextElementSibling; // Предполагаем, что список следует за селектом
        dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
    });
});

// Закрытие выпадающего списка при клике вне его
document.addEventListener('click', (event) => {
    if (!event.target.closest('.controls .row')) {
        selectTag.forEach(selector => {
            const dropdown = selector.nextElementSibling;
            dropdown.style.display = 'none';
        });
    }
});
