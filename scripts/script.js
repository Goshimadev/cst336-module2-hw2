class SlotMachine {
  // Model
  constructor() {
    this.numScreens = 3;
    this.symbols = ["7", "cherries", "bell", "bar"];
    this.symbolImage = {
      7: "img/slot-symbol1.png",
      cherries: "img/slot-symbol2.png",
      bell: "img/slot-symbol3.png",
      bar: "img/slot-symbol4.png",
    };
    this.slotScreen = ["7", "7", "7"];
    this.wallet = 1000;
    this.baseWinnings = 100;
  }

  // Controller
  initializeGame() {
    this.randomizeSlotScreens();
    this.updateSlotScreens();
    this.updateWallet();
    this.updateBetField();
  }

  randomizeSlotScreens() {
    for (let x = 0; x < this.numScreens; x++) {
      this.slotScreen[x] =
        this.symbols[Math.floor(Math.random() * this.numScreens)];
    }
  }

  winningsCalculation() {
    let multiplier = 0;

    let slotResults = this.slotScreen.reduce(function (results, symbol) {
      if (symbol in results) {
        results[symbol]++;
      } else {
        results[symbol] = 1;
      }
      return results;
    }, {});

    if (slotResults["bar"] == 3) {
      multiplier = 4;
    } else if (slotResults["bell"] == 3) {
      multiplier = 3;
    } else if (slotResults["cherries"] == 3) {
      multiplier = 2.5;
    } else if (slotResults["7"] == 3) {
      multiplier = 2;
    } else if (
      slotResults["bar"] == 2 ||
      slotResults["bell"] == 2 ||
      slotResults["cherries"] == 2 ||
      slotResults["7"] == 2
    ) {
      multiplier = 1.25;
    }

    this.wallet += this.baseWinnings * multiplier;
    console.log(`${this.wallet}`);
  }

  isGameOver(){
      return this.wallet == 0;
  }

  // view
  updateSlotScreens() {
    for (let x = 0; x < this.numScreens; x++) {
      $(`#slot-symbol-${x}`).html(
        `<img id=s${x} src="${this.symbolImage[this.slotScreen[x]]}">`
      );
    }
  }

  updateWallet() {
      $("#wallet").html(`${this.wallet}`);
  }

  updateBetField(){
      $("#bet-field").html(`<input type="number" id="bet" min="1" max="${this.wallet}">`);
  }
}

$(document).ready(function () {
  // Initialize Game
  const slotMachine = new SlotMachine();
  var screenAnimation;
  isSpinning = false;
  slotMachine.initializeGame();

  // Variables

  // Functions
  function startSpinning() {
    $("#machine-img").find("img").fadeOut().fadeIn();
    $(".slot").effect("shake", { direction: "up", times: 1 });
    $("#spin").html("Stop");

    slotAnimation = setInterval(function () {
      $(".slot").toggleClass("blur");
      slotMachine.randomizeSlotScreens();
      slotMachine.updateSlotScreens();
    }, 50);
  }

  function stopSpinning() {
    $("#spin").html("Pull");
    $("#machine-img").find("img").fadeOut().fadeIn();
    setTimeout(function () {
      $(".slot").effect("shake", { direction: "up", times: 1 });
      $(".slot").removeClass("blur");
      clearInterval(slotAnimation);
      slotMachine.updateSlotScreens();
      slotMachine.winningsCalculation();
      slotMachine.updateWallet();
      console.log(`Stop: ${slotMachine.slotScreen}`);
    }, 1000);
  }

  // Event Listeners
  $("#spin").on("click", function () {
    isSpinning ? stopSpinning() : startSpinning();
    isSpinning = isSpinning ? false : true;
  });
});
