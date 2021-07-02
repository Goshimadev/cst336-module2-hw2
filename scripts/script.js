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
    this.currentBet = 0;
  }

  // Controller
  initializeGame() {
    this.randomizeSlotScreens();
    this.updateSlotScreens();
    this.updateWallet();
    this.updateBetField();
  }

  placeBet(betAmt) {
    this.wallet -= betAmt;
    this.updateWallet();
  }

  randomizeSlotScreens() {
    for (let x = 0; x < this.numScreens; x++) {
      this.slotScreen[x] =
        this.symbols[Math.floor(Math.random() * this.numScreens)];
    }
  }

  winningsCalculation(betAmt = 0) {
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
    let winnings = betAmt * multiplier;
    this.wallet += winnings;
    this.updateResults(multiplier > 0 ? true : false, winnings);
  }

  isGameOver() {
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

  updateBetField() {
    $("#bet-field").html(
      `<input type="number" id="bet" min="1" max="${this.wallet}">`
    );
  }

  updateResults(isWinner, winnings = 0) {
    if (isWinner) {
      $("#results span").html(`Congratulations! You have won $${winnings}`);
    } else {
      $("#results span").html(
        `You didn't win on your last pull. Better luck next time!`
      );
    }
  }
}

$(document).ready(function () {
  // Initialize Game
  const slotMachine = new SlotMachine();
  slotMachine.initializeGame();

  // Variables
  var slotAnimation = null;
  var isSpinning = false;
  var betAmt = 0;

  // Functions
  function pull() {
    if (isSpinning) {
      stopSpinning();
    } else {
      startSpinning();
    }

    isSpinning = !isSpinning;
  }

  function validateBet(betAmt, walletAmt) {
    if (betAmt == "") {
      $("#info span").html("You have to enter a bet in order to play!");
      return false;
    } else if (betAmt <= 0) {
      $("#info span").html("You cannot bet 0 or less dollars!");
      return false;
    } else if (betAmt > walletAmt) {
      $("#info span").html("You don't have enough money to make that bet!");
      return false;
    }

    return true;
  }

  function startSpinning() {
    slotMachine.placeBet(betAmt);
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
      slotMachine.winningsCalculation(betAmt);
      slotMachine.updateWallet();
      console.log(`Stop: ${slotMachine.slotScreen}`);
    }, 1000);
  }

  // Event Listeners
  $("#spin").on("click", function () {
    betAmt = $("#bet").val();
    let walletAmt = slotMachine.wallet;

    if (!validateBet(betAmt, walletAmt)) {
      return;
    }

    pull();
  });
});
