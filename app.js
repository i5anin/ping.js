const ping = require("ping");
const chalk = require("chalk");
const contrib = require("blessed-contrib");
const blessed = require("blessed");

// Создаем экран и виджет графика
const screen = blessed.screen();
const line = contrib.line({
  style: {
    line: "yellow",
    text: "green",
    baseline: "black",
  },
  xLabelPadding: 3,
  xPadding: 5,
  label: "Ping Response Time",
});

// Настройки для графика
let data = {
  x: [],
  y: [],
};
let series = [{ title: "Ping", x: data.x, y: data.y, style: { line: "red" } }];
screen.append(line);
line.setData(series);

let count = 0;
const targetIP = "192.168.1.168"; // Измените на целевой IP-адрес
console.log(chalk.blue(`Starting ping monitor for ${targetIP}`));

// Функция для обновления данных и вывода в консоль
function updateData() {
  ping.promise
    .probe(targetIP, { timeout: 10 }) // Установите тайм-аут при необходимости
    .then(function (res) {
      if (res.alive) {
        console.log(
          chalk.green(`Response from ${targetIP}: time=${res.time}ms`)
        );
        // Добавление данных для графика
        data.x.push((count % 30).toString()); // Ограничиваем количество точек данных для отображения
        data.y.push(res.time);
        if (data.x.length > 30) {
          // Удаляем старые данные, чтобы график был актуальным
          data.x.shift();
          data.y.shift();
        }
        line.setData(series);
        screen.render(); // Обновляем экран
      } else {
        console.log(chalk.red(`No response from ${targetIP}`));
      }
      count++;
    })
    .catch((error) => {
      console.error(chalk.red(`Error: ${error}`));
    });
}

// Запускаем мониторинг каждые 5 секунд
setInterval(updateData, 5000);

// Настройка выхода по нажатию клавиш
screen.key(["escape", "q", "C-c"], function (ch, key) {
  return process.exit(0);
});
