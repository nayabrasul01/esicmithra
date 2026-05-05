export const addDays = (date, days) => {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
};

export const formatDate = (date) => {
  return new Date(date).toISOString().split("T")[0];
};

// export const calculateLeaveDates = ({ type, previousCert, leavesRequired }) => {
//   const today = new Date();

//   let leaveFrom;

//   if (previousCert?.leaveTo) {
//     const nextDay = addDays(previousCert.leaveTo, 1);
//     leaveFrom = nextDay > today ? nextDay : today;
//   } else {
//     leaveFrom = today;
//   }

//   const leaveTo = addDays(leaveFrom, leavesRequired - 1);

//   return {
//     leaveFrom: formatDate(leaveFrom),
//     leaveTo: formatDate(leaveTo),
//   };
// };

export const calculateLeaveFrom = (leaveTo) => {
  const today = new Date();

  let leaveFrom;

  if (leaveTo) {
    const nextDay = addDays(leaveTo, 1);
    leaveFrom = nextDay > today ? nextDay : today;
  } else {
    leaveFrom = today;
  }

  return formatDate(leaveFrom);
};

export const calculateLeaveTo = (leaveFrom, days) => {
  if (!leaveFrom || !days) return "";

  const date = new Date(leaveFrom);
  date.setDate(date.getDate() + (days - 1));

  return date.toISOString().split("T")[0];
};

export const calculateFollowUpDate = (leaveTo, days) => {
  if (!leaveTo || !days) return "";

  const date = new Date(leaveTo);
  date.setDate(date.getDate() + days);

  return date.toISOString().split("T")[0];
};
