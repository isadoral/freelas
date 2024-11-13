export const determineWinningParty = (results) => {
    // Return null if results are empty or any candidate has 0% and no seats are assigned
    if (!results || results.length === 0) {
      return null;
    }
  
    const hasZeroPercentage = results.every(
      (candidate) => candidate.percentage === 0
    );
    const noSeats = results.every(
      (candidate) => !candidate.seats || candidate.seats === 0
    );
  
    // Handle cases where there is zero percentage but seats are available
    if (hasZeroPercentage && !noSeats) {
      // Determine the winner based on seats in this case
      const winnerBySeats = results.reduce((prev, current) =>
        prev.seats > current.seats ? prev : current
      );
      return winnerBySeats.party;
    }
  
    if (hasZeroPercentage && noSeats) {
      return null;
    }
  
    // Otherwise, find the candidate with the highest percentage
    const winnerByPercentage = results.reduce((prev, current) =>
      prev.percentage > current.percentage ? prev : current
    );
  
    return winnerByPercentage.party;
  };
  
  // Additional helper functions can be added here
  export const isResultComplete = (results) => {
    return (
      results &&
      results.length > 0 &&
      !results.some((candidate) => candidate.percentage === 0)
    );
  };
  
  export const getWinningMargin = (results) => {
    if (!isResultComplete(results)) return null;
  
    const sortedResults = [...results].sort(
      (a, b) => b.percentage - a.percentage
    );
    return sortedResults[0].percentage - sortedResults[1].percentage;
  };
  
  export const getDynamicText = (state) => {
    if (!state || !Array.isArray(state.results) || state.results.length === 0) {
      console.error("Invalid state or empty results array");
      return "Kein Ergebnis in";
    }
    const hasZeroPercentage = state.results.every(
      (candidate) => candidate.percentage === 0 || candidate.percentage === null
    );
    const noSeats = state.results.every(
      (candidate) => !candidate.seats || candidate.seats === 0
    );
  
    const winningParty = determineWinningParty(state.results);
    if (!winningParty) {
      return "Kein Ergebnis in";
    }
  
    const candidate = state.results.find(
      (result) =>
        result.party && result.party.toLowerCase() === winningParty.toLowerCase()
    );
  
    if (!candidate || !candidate.candidate) {
      return "Kein Ergebnis in";
    }
  
    const words = candidate.candidate.trim().split(" ");
    const candidateLastName =
      words.length > 0 ? words[words.length - 1] : "Unbekannt";
  
    const possibilities = [
      "Kein Ergebnis in",
      "Offenes Rennen in",
      `${candidateLastName} führt in`,
      `${candidateLastName} gewinnt in`,
    ];
  
    if (state.percentageCounted === 100) {
      return possibilities[3];
    } else if (hasZeroPercentage) {
      return possibilities[2];
    } else if (!hasZeroPercentage && getWinningMargin(state.results) <= 5) {
      return possibilities[1];
    } else if (!hasZeroPercentage && getWinningMargin(state.results) > 5) {
      return possibilities[2];
    }
  
    return possibilities[0];
  };
  
  export const determineTendency = (results) => {
    if (!results || results.length === 0) return null;
    const noSeats = results.every(
      (candidate) => !candidate.seats || candidate.seats === 0
    );
  
    const { totalSeats, maxSeatsCandidate } = results.reduce(
      (acc, candidate) => {
        acc.totalSeats += candidate.seats;
        if (candidate.seats > acc.maxSeatsCandidate.seats) {
          acc.maxSeatsCandidate = candidate;
        }
        return acc;
      },
      {
        totalSeats: 0,
        maxSeatsCandidate: { seats: 0, seats_safe: 0, seats_likely: 0 },
      }
    );
  
    if (totalSeats === 0 || noSeats) return null;
  
    if (maxSeatsCandidate.seats_safe > 0) return "safe";
    if (maxSeatsCandidate.seats_likely > 0) return "likely";
    if (maxSeatsCandidate.seats_leans > 0) return "leans";
    return null;
  };
  
  export const formatDate = (date) => {
    const d = new Date(date);
  
    // Format day, month, and year to two digits using UTC methods
    const day = String(d.getUTCDate()).padStart(2, '0');
    const month = String(d.getUTCMonth() + 1).padStart(2, '0');
    const year = d.getUTCFullYear();
  
    // Check if there are hours, minutes, or seconds in UTC
    const hours = d.getUTCHours() ? String(d.getUTCHours()).padStart(2, '0') : '';
    const minutes = d.getUTCMinutes() ? String(d.getUTCMinutes()).padStart(2, '0') : '';
    const seconds = d.getUTCSeconds() ? String(d.getUTCSeconds()).padStart(2, '0') : '';
  
    // Format the main date part
    let formattedDate = `${day}.${month}.${year}`;
  
    // Append time components if they exist
    if (hours || minutes || seconds) {
        const time = [hours, minutes, seconds].filter(Boolean).join(':');
        formattedDate += ` ${time}`;
    }
  
    return formattedDate;
  };
  
  // LIVE
  // export const actualUrl = (yearNum) => {
  //   return `https://electiondata.api2.bild.de/api-v1/presidential/election/${yearNum}/map/results`;
  // }
  
  // POLL
  // export const actualUrl = (yearNum) => {
  //   return "https://electiondata.api2.bild.de/api-v1/presidential/election/map/poll/6718bdb9d85d2360459b7a32";
  // };
  
  // Toggle
  export const actualUrl = (yearNum) => {
    return `https://electiondata.api2.bild.de/api-v1/presidential/election/map/autotoggle/${yearNum}`;
  };