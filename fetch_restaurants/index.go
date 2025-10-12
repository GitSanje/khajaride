package main

import (
	"encoding/json"
	"fmt"
	"os"
)

func main() {
	file, err := os.Open("foodmandu_all_restaurants.json")
	if err != nil {
		fmt.Println("Error opening file:", err)
		return
	}
	defer file.Close()

	var data map[string]interface{}
	decoder := json.NewDecoder(file)
	err = decoder.Decode(&data)
	if err != nil {
		fmt.Println("Error decoding JSON:", err)
		return
	}

	uniqueVendorIDs := make(map[int]struct{})
	newData := make(map[string]interface{})
	newData["vendors"] = []interface{}{}

	for _, vendors := range data {
		vendorList, ok := vendors.([]interface{})
		if !ok {
			continue
		}

		for _, v := range vendorList {
			vendorMap, ok := v.(map[string]interface{})
			if !ok {
				continue
			}

			idFloat, ok := vendorMap["Id"].(float64)
			if !ok {
				continue
			}
			id := int(idFloat)

			// Only include vendor if its ID is not already in the set
			if _, exists := uniqueVendorIDs[id]; !exists {
				uniqueVendorIDs[id] = struct{}{}
				newData["vendors"] = append(newData["vendors"].([]interface{}), vendorMap)
			}
		}
	}

	newFile, err := os.Create("new_vendors.json")
	if err != nil {
		fmt.Println("Error creating file:", err)
		return
	}
	defer newFile.Close()

	encoder := json.NewEncoder(newFile)
	encoder.SetIndent("", "  ")
	err = encoder.Encode(newData)
	if err != nil {
		fmt.Println("Error encoding JSON:", err)
		return
	}

	fmt.Println("New JSON file with unique vendors written successfully!")
}
