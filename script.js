function optimize() {
    var students = parseInt(document.getElementById("students").value)
    var t = parseFloat(document.getElementById("t").value)
    var ft = parseFloat(document.getElementById("ft").value)
    var stars = parseFloat(document.getElementById("stars").value)

    var adBonus = document.getElementById("adbonus").checked
    var ignoreTheories = document.getElementById("ignoretheories").checked
    var acceleration = document.getElementById("acceleration").checked
    var accelerationBonus = parseFloat(document.getElementById("accelmult").value)

    var log10dmu = ft
    var log10db = (ft * 0.8) - Math.log10(4e6)
    var log10dpsi = (ft / 25.0 - 1) * Math.log10(2)

    var dtSpeedUpgrades = ft / (15.0 * Math.log10(2))
    var dtSpeed = (dtSpeedUpgrades + 0.1) / 10
    var dtLevels = ft / Math.log10(4)
    var dt = dtSpeed * dtLevels

    if (adBonus) { dt *= 1.5 }
    if (acceleration) { dt *= accelerationBonus }

    function getCost(num) {
        if (num % 2 === 1) {
            return (Math.pow(num, 2) - 1) / 4 + (num + 1) / 2
        } else {
            return (Math.pow(num, 2) + 2 * num) / 4
        }
    }

    var boosts = [
        Math.log10(dt),
        0.7 * Math.log10(1 + t),
        Math.log10(1 + stars),
        log10db / Math.sqrt(100 * log10db),
        log10dmu / 1300.0,
        log10dpsi / 225 * Math.sqrt(log10dpsi),
        0.1
    ]

    var order = [0, 0, 0, 0, 0, 0, 0]
    var cost = 0

    if (!ignoreTheories) {
        if (students >= 60) {
            students -= 60
        }
        else if (students >= 20) {
            students -= 20
            while (students >= 5) {
                students -= 5
            }
        }
    }

    function getBest(order, remainingStudents) {
        var bestBoostPerCost = 0
        var bestI = -1
        var bestCost = 0
        for (var i = 0; i < order.length; i++) {
            if ((i >= 3 && i < 6 && order[i] === 8) || (i === 6 && order[i] === 6)) {
                continue
            }
            if (i === 6 && remainingStudents >= 2) {
                bestPerCost = 0.05 * (
                    order[0] * boosts[0] + order[1] * boosts[1] + order[2] * boosts[2] +
                    order[3] * boosts[3] + order[4] * boosts[4] + order[5] * boosts[5]
                )
                cost = 2
            }
            else {
                cost = (getCost(order[i] + 1) - getCost(order[i]))
                if (cost > remainingStudents) {
                    continue
                }
                extraBoost = (1 + order[6] * boosts[6]) * boosts[i]
                bestPerCost = extraBoost / cost
            }
            if (bestPerCost > bestBoostPerCost) {
                bestBoostPerCost = bestPerCost
                bestI = i
                bestCost = cost
            }
        }
        if (bestI !== -1) {
            order[bestI] += 1
            return order, remainingStudents - bestCost
        }
        else {
            return order, 0
        }
    }

    var remainingStudents = students
    while (remainingStudents > 0) {
        order, remainingStudents = getBest(order, remainingStudents)
    }

    var phi = (
        (1 + order[6] * boosts[6]) *
        (
            order[0] * boosts[0] + order[1] * boosts[1] + order[2] * boosts[2] +
            order[3] * boosts[3] + order[4] * boosts[4] + order[5] * boosts[5]
        )
    )
    var phiDigits = Math.pow(10, phi - Math.floor(phi))

    document.getElementById("output").innerHTML = (
        /*
        "Students: " + students + "<br>t: " + t + "<br>f(t): ee" + ft +
        "<br>Stars: " + stars + "<br>Ad-bonus: " + adBonus +
        "<br>Acceleration: " + acceleration + " and " + accelerationBonus + "x" +
        "<br>" +
        */
        "Calculated dt: " + dt + "<br>Phi: " + phiDigits + "e" + Math.floor(phi) +
        "<br>Student distribution: " + order.join(", ")
    )
}

optimize()
