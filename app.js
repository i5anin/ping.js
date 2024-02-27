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

// Настройки для графика и мониторинга адресов
const targetIPs = [
  "192.168.1.1",
  "192.168.1.2",
  "192.168.1.3",
  "192.168.1.4",
  "192.168.1.5",
  "192.168.1.6",
  "192.168.1.7",
  "192.168.1.8",
  "192.168.1.9",
  "192.168.1.10",
];
let dataSeries = targetIPs.map((ip) => ({
  title: ip,
  x: [],
  y: [],
  style: { line: "red" },
}));

// Функция для обновления данных и вывода в консоль
function updateData() {
  targetIPs.forEach((targetIP, index) => {
    ping.promise
      .probe(targetIP)
      .then(function (res) {
        if (res.alive) {
          console.log(
            chalk.green(`Response from ${targetIP}: time=${res.time}ms`)
          );
          dataSeries[index].x.push(dataSeries[index].x.length.toString());
          dataSeries[index].y.push(res.time);
          if (dataSeries[index].x.length > 30) {
            // Ограничиваем количество точек данных
            dataSeries[index].x.shift();
            dataSeries[index].y.shift();
          }
        } else {
          console.log(chalk.red(`No response from ${targetIP}`));
        }
        if (index === targetIPs.length - 1) {
          // Обновляем график только после последнего IP
          line.setData(dataSeries);
          screen.render();
        }
      })
      .catch((error) => {
        console.error(chalk.red(`Error: ${error}`));
      });
  });
}

// Инициализация графика и мониторинг
screen.append(line);
line.setData(dataSeries);
console.log(chalk.blue("Starting ping monitor for multiple targets"));

// Запускаем мониторинг каждые 5 секунд
setInterval(updateData, 5000);

// Настройка выхода по нажатию клавиш
screen.key(["escape", "q", "C-c"], function (ch, key) {
  return process.exit(0);
});
