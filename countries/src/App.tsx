import React, { useState, useEffect } from "react";

interface User {
  gender: string;
  name: {
    title: string;
    first: string;
    last: string;
  };
  location: {
    street: {
      number: number;
      name: string;
    };
    city: string;
    state: string;
    country: string;
    postcode: number;
  };
  registered: {
    date: string;
    age: number;
  };
  phone: string;
  cell: string;
  id: {
    name: string;
    value: string;
  };
}
interface CountryUsers {
  country: string;
  users: User[];
}
const App = () => {
  const [countries, setCountries] = useState<CountryUsers[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [filterGender, setFilterGender] = useState<"male" | "female" | "all">(
    "all"
  );

  useEffect(() => {
    async function fetchData() {
      const users = await fetchUsers();
      const processedData = groupAndSortUsers(users);
      setCountries(processedData);
    }
    fetchData();
  }, []);

  async function fetchUsers(): Promise<User[]> {
    const response = await fetch("https://randomuser.me/api/?results=100");
    const data = await response.json();
    return data.results;
  }

  function groupAndSortUsers(users: User[]): CountryUsers[] {
    const countriesMap = users.reduce((acc, user) => {
      if (!acc[user.location.country]) {
        acc[user.location.country] = {
          country: user.location.country,
          users: [],
        };
      }
      acc[user.location.country].users.push(user);
      return acc;
    }, {} as Record<string, CountryUsers>);
    return Object.values(countriesMap).map((countryUsers) => ({
      ...countryUsers,
      users: countryUsers.users.sort(
        (a, b) =>
          new Date(b.registered.date).getTime() -
          new Date(a.registered.date).getTime()
      ),
    }));
  }

  // filter users as condition
  const filteredUsers = selectedCountry
    ? countries
        .find((country) => country.country === selectedCountry)
        ?.users.filter(
          (user) => filterGender === "all" || user.gender === filterGender
        )
    : [];

  return (
    <div className="container">
      <div>
        {/* Countries List */}
        <ul>
          {countries.map((country) => (
            <li
              key={country.country}
              onClick={() => setSelectedCountry(country.country)}
            >
              {country.country}
            </li>
          ))}
        </ul>

        {/* Dropdown List */}
        <select
          value={filterGender}
          onChange={(e) =>
            setFilterGender(e.target.value as "male" | "female" | "all")
          }
        >
          <option value="all">All</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
        </select>

        {/* userList in selected Country */}
        {selectedCountry && (
          <ul>
            {filteredUsers ? (
              filteredUsers.map((user) => (
                <li key={`${user.name.first}_${user.name.last}`}>
                  <div>
                    Name:{" "}
                    {`${user.name.title} ${user.name.first} ${user.name.last}`}
                  </div>
                  <div>Gender: {user.gender}</div>
                  <div>City: {user.location.city}</div>
                  <div>State: {user.location.state}</div>
                  <div>
                    Date Registered:{" "}
                    {new Date(user.registered.date).toLocaleDateString()}
                  </div>
                </li>
              ))
            ) : (
              <li>No users found</li>
            )}
          </ul>
        )}
      </div>
    </div>
  );
};
export default App;
