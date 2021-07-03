/**
 * Holds class attributes related to slot machine log,
 * performs modification to attributes and updates content
 * of webpage.
 */
class SlotMachine {
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
    this.wallet = 0;
    this.currentBet = 0;
  }

  /**
   * Sets #hud and wallet back to initial values.
   */
  initializeGame() {
    this.wallet = 1000;

    this.randomizeSlotScreens();
    this.updateSlotScreens();
    this.resetMessages();

    this.updateWallet();
    this.updateBetField();
  }

  /**
   * Subtracts value of parameter from wallet and updates #hud
   * @param {int} betAmt
   */
  placeBet(betAmt) {
    this.wallet -= betAmt;
    this.updateWallet();
  }

  /**
   * Randomizes values of slotScreen array using values held in
   * symbols array as a reference.
   */
  randomizeSlotScreens() {
    for (let x = 0; x < this.numScreens; x++) {
      this.slotScreen[x] =
        this.symbols[Math.floor(Math.random() * this.numScreens)];
    }
  }

  /**
   * Calculates value of winnings as the product of a multiplier
   * and the amount bet, then updates wallet and #hud
   * @param {int} betAmt
   */
  winningsCalculation(betAmt = 0) {
    let multiplier = 0;

    // reduce() returns a dictionary of "symbol" : count
    let slotResults = this.slotScreen.reduce(function (results, symbol) {
      if (symbol in results) {
        results[symbol]++;
      } else {
        results[symbol] = 1;
      }
      return results;
    }, {});

    // multiplier is calculated based on number of symbols and not order
    if (slotResults["bar"] == 3) {
      multiplier = 4;
    } else if (slotResults["bell"] == 3) {
      multiplier = 3;
    } else if (slotResults["cherries"] == 3) {
      multiplier = 2.5;
    } else if (slotResults["7"] == 3) {
      multiplier = 2;
    } else if (slotResults["bar"] == 2 || slotResults["7"] == 2) {
      multiplier = 1.25;
    }

    //Calculates winnings, updates wallet (2 precision), updates #results content
    let winnings = betAmt * multiplier;
    this.wallet += Number(winnings.toFixed(2));
    this.updateResults(multiplier > 0 ? true : false, winnings);
  }

  /**
   * If wallet is empty: Sets text on #spin to "Restart" and returns true. Else,
   * returns false.
   * @returns {boolean}
   */
  gameOver() {
    if (this.wallet <= 0) {
      $("#spin").html("Restart");
      return true;
    }
    return false;
  }

  /**
   * Sets #hud messages to initial values.
   */
  resetMessages() {
    $("#results span").html("");
    $("#results span").removeClass("warning success");
    $("#info span").html('Click <kbd>"Pull"</kbd> to start the game!');
    $("#spin").html("Pull");
  }

  /**
   * Updates images on #slot-screen by comparing values in slotScreen with
   * symbolImage dictionary.
   */
  updateSlotScreens() {
    for (let x = 0; x < this.numScreens; x++) {
      $(`#slot-symbol-${x}`).html(
        `<img id=s${x} src="${this.symbolImage[this.slotScreen[x]]}">`
      );
    }
  }

  /**
   * Updates content of #wallet (precision 2).
   */
  updateWallet() {
    $("#wallet").html(`${this.wallet.toFixed(2)}`);
  }

  /**
   * Adds input box (number) as #bet to #hud.
   */
  updateBetField() {
    $("#bet-field").html(`<input type="number" id="bet" class="form-control">`);
  }

  /**
   * Updates #info content based on round results. Applies background color
   * to text if: (1) game has ended or (2) player won last round.
   * @param {boolean} isWinner
   * @param {int} winnings
   */
  updateResults(isWinner, winnings = 0) {
    if (this.gameOver()) {
      $("#results span").html(
        `You've lost the last round and run out of money... Click <kbd>"Restart"</kbd> to play again!`
      );
      $("#results span").addClass("warning");
      console.log("restarted");
    } else if (isWinner) {
      $("#results span").html(
        `Congratulations! You have won $${winnings.toFixed(2)}.`
      );
      $("#results span").addClass("success");
    } else {
      $("#results span").html(
        `You didn't win on your last pull. Better luck next time!`
      );
    }
  }
}

/**
 * "main" method, which runs after page is loaded.
 */
$(document).ready(function () {
  // Initialize Game
  const slotMachine = new SlotMachine();
  slotMachine.initializeGame();

  // Variables
  var slotAnimation = null; // holds setInterval value for animation
  var isSpinning = false;
  var betAmt = 0;

  /**
   * Starts spin animation and updates model/view if #slot-screen is stopped.
   * Stops spin animation and updates model/view if #slot-screen is spinning.
   * Toggles value of isSpinning on each call.
   */
  function pull() {
    if (isSpinning) {
      stopSpinning();
    } else {
      startSpinning();
    }

    isSpinning = !isSpinning;
  }

  /**
   * Performs input validation on #bet and applies background color if
   * validation fails. Removes background color if validation passes.
   * Updates content on "#info span".
   * @param {int} betAmt Value of #bet.
   * @param {int} walletAmt Value of slotMachine.wallet
   * @returns {boolean} true if passed validation, else false.
   */
  function validateBet(betAmt, walletAmt) {
    if (betAmt == "") {
      $("#info span").html("You have to enter a bet in order to play!");
      $("#info span").addClass("warning");
      return false;
    } else if (betAmt <= 0) {
      $("#info span").html("You cannot bet 0 or less dollars!");
      $("#info span").addClass("warning");
      return false;
    } else if (betAmt > walletAmt) {
      $("#info span").html("You don't have enough money to make that bet!");
      $("#info span").addClass("warning");
      return false;
    }
    $("#info span").removeClass("warning");
    return true;
  }

  /**
   * Performs updates and animations after calling pull(). Assumes validation
   * was performed on betAmt previously.
   */
  function startSpinning() {
    // Update value of slotMachine.wallet
    slotMachine.placeBet(betAmt);

    // Plays "spin" animations (lever pull and shake symbols)
    $("#machine-img").find("img").fadeOut().fadeIn();
    $(".slot").effect("shake", { direction: "up", times: 1 });

    // Updates #hud contents and style, disables #spin to avoid race condition
    $("#spin").prop("disabled", true).html("Starting...");
    $("#results span").removeClass("warning success");
    $("#results span").html("Spinning...");

    // Enables #spin button after 1s to sync with animation (below) then updates content
    setTimeout(function () {
      $("#spin").prop("disabled", false).html("Stop");
    }, 1000);

    // Updates contents of #slot-screen every 50ms and applies animation effects
    slotAnimation = setInterval(function () {
      $(".slot").toggleClass("blur");
      slotMachine.randomizeSlotScreens();
      slotMachine.updateSlotScreens();
    }, 50);
  }

  /**
   * Performs updates and animations after calling pull(). isSpinning should be true.
   */
  function stopSpinning() {
    // updates content and plays animation (lever pull)
    $("#spin").prop("disabled", true).html("Stopping...");
    $("#machine-img").find("img").fadeOut().fadeIn();

    // Stop animation is played after 1s to simulate "wind down"
    setTimeout(function () {
      // updates content, plays animation and removes blur effect
      $("#spin").prop("disabled", false).html("Pull");
      $(".slot").effect("shake", { direction: "up", times: 1 });
      $(".slot").removeClass("blur");

      // stops "spin" animation
      clearInterval(slotAnimation);

      //updates #hud content and slotMachine.wallet
      slotMachine.updateSlotScreens();
      slotMachine.winningsCalculation(betAmt);
      slotMachine.updateWallet();

      // outputs results of slotScreen to console for debug
      console.log(`Stop: ${slotMachine.slotScreen}`);
    }, 1000);
  }

  /**
   * Event listener for the #spin button. Calls spin(), pull() or
   * restarts the game on click.
   */
  $("#spin").on("click", function () {
    // restarts game and plays animation if #spin set to "Restart"
    if ($("#spin").html() == "Restart") {
      slotMachine.initializeGame();
      $(".slot").effect("shake", { direction: "up", times: 1 });
      return;
    }

    // ignores #bet and calls pull() if slotMachine is spinning
    if (isSpinning) {
      pull();
    } else {
      // if slotMachine is stopped, performs validation, updates and pulls
      betAmt = $("#bet").val();
      let walletAmt = slotMachine.wallet;
      if (validateBet(betAmt, walletAmt)) {
        slotMachine.resetMessages();
        pull();
      }
    }
  });
});
