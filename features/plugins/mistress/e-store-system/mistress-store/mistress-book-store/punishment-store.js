export const punishmentStore = {
  active: [],
  history: [],

  presets: [
    {
      id: "temp-block",
      name: "Temporary Block",
      description: "Blocks the user for a limited period.",
      duration: "24 hours",
      severity: "Medium"
    },
    {
      id: "timed-invisibility",
      name: "Timed Invisibility",
      description: "Makes the profile invisible for a period.",
      duration: "12 hours",
      severity: "High"
    },
    {
      id: "message-restriction",
      name: "Message Restriction",
      description: "Prevents sending messages temporarily.",
      duration: "6 hours",
      severity: "Low"
    },
    {
      id: "extinguish",
      name: "Extinguish",
      description: "Placeholder for a full removal / hide action.",
      duration: "Manual",
      severity: "Critical"
    }
  ]
};
