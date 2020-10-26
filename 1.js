// min_cheermote_amount: number - all cheers must have equal to or greater than the number of cheers listed
// valid_cheermotes: string[] - A list of all valid cheer emotes
// messages: string - All messages to be parsed, concatenated with comma delimiters
function (min_cheermote_amount, valid_cheermotes, messages) {
  const message_split = messages.split(',');
  const cheer_regexs = valid_cheermotes.map((cheer) =>({
    name: cheer,
    regex: new RegExp(`(${cheer})(\\d+)`, 'g'),
  }));

  const cheer_mappings = message_split.map((message) => {
    const bit_types = {};
    let is_valid_message = true;
    let bit_total = 0;
    cheer_regexs.forEach((cheer) => {
      if (is_valid_message) {
        const { regex, name } = cheer;
        const matches = message.match(regex);
        if (matches) {
          matches.forEach((match) => {
            const number = Number.parseInt(match.replace(name, ''), 10);
            if (number && number >= min_cheermote_amount && number <= 10000) {
              bit_types[name] = number + (bit_types[name] ?? 0);
              bit_total += number;
              if (bit_total > 100000) {
                // Cannot have more than 100000 bits per message
                is_valid_message = false;
              }
            } else {
              // number is either higher than 10000 or otherwise invalid
              is_valid_message = false;
            }
          });
        }
      }
    });
    // if the message is invalid, discard entire message
    return is_valid_message ? bit_types : {};
  });

  const valid_cheers = [];
  cheer_mappings.forEach((cheer_mapping) => {
    Object.keys(cheer_mapping).forEach((cheer) => {
      const index = valid_cheers.findIndex((cheer_obj) => cheer_obj.cheer === cheer);
      if (index === -1) {
        // new emote time
        valid_cheers.push({
          cheer,
          count: cheer_mapping[cheer],
        });
      } else {
        // add to the existing cheer type
        valid_cheers[index].count += cheer_mapping[cheer];
      }
    });
  });
  valid_cheers.sort((a, b) => (a.count < b.count ? 1 : -1));
  if (valid_cheers.length === 0) {
    return ['NO_CHEERS'];
  }
  return valid_cheers.map((cheer) => `${cheer.cheer}${cheer.count}`);
};
