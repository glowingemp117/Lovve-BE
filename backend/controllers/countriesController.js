const Country = require("../schemas/country");

async function getAllCountries(req, res) {
  try {
    const countries = await Country.find();

    const modifiedCountries = countries.map(country => ({
      id: country._id,
      name: country.name,
      flag: country.flag,
    }));
    

    res.status(200).json({    
      status: 200,
      message: "Fetched successfully",
      countries: modifiedCountries,
    });
  } catch (error) {
    console.error("Error fetching countries:", error);
    res.status(500).json({ message: "Server error" });
  }
}

module.exports = {
  getAllCountries,
};
