export const userStore = {
  currentUser: null,
  favourites: [],
  blocked: [],
  notifications: [
    { id: "n1", text: "Welcome to Mistress-X" }
  ],
  users: [
    {
      id: "sub-1",
      name: "Sub 1",
      role: "sub",
      status: "online",
      location: "New York",
      bio: "Obedient and punctual."
    },
    {
      id: "sub-2",
      name: "Sub 2",
      role: "sub",
      status: "away",
      location: "Chicago",
      bio: "Prefers strict routines."
    },
    {
      id: "mistress-1",
      name: "Mistress 1",
      role: "mistress",
      status: "online",
      location: "Los Angeles",
      bio: "Directive, analytical, and direct."
    },
    {
      id: "mistress-2",
      name: "Mistress 2",
      role: "mistress",
      status: "busy",
      location: "Miami",
      bio: "Focuses on discipline plans."
    },
    {
      id: "support-1",
      name: "Mistress Support",
      role: "mistress",
      status: "online",
      location: "Remote",
      bio: "Support queue and escalations."
    }
  ]
};
