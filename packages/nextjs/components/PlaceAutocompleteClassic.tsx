import React, { FormEvent, useCallback, useEffect, useState } from "react";
import { useMap, useMapsLibrary } from "@vis.gl/react-google-maps";

interface Props {
  onPlaceSelect: (place: google.maps.places.PlaceResult | null) => void;
  isOnline: boolean;
  existingValue?: string;
}

export const AutocompleteCustom = ({ onPlaceSelect, isOnline, existingValue }: Props) => {
  const map = useMap();
  const places = useMapsLibrary("places");

  const [sessionToken, setSessionToken] = useState<google.maps.places.AutocompleteSessionToken>();

  const [autocompleteService, setAutocompleteService] = useState<google.maps.places.AutocompleteService | null>(null);

  const [placesService, setPlacesService] = useState<google.maps.places.PlacesService | null>(null);

  const [predictionResults, setPredictionResults] = useState<Array<google.maps.places.AutocompletePrediction>>([]);

  const [inputValue, setInputValue] = useState<string>("");

  useEffect(() => {
    if (!places || !map) return;

    setAutocompleteService(new places.AutocompleteService());
    setPlacesService(new places.PlacesService(map));
    setSessionToken(new places.AutocompleteSessionToken());

    return () => setAutocompleteService(null);
  }, [map, places]);

  const fetchPredictions = useCallback(
    async (inputValue: string) => {
      if (!autocompleteService || !inputValue) {
        setPredictionResults([]);
        return;
      }

      const request = { input: inputValue, sessionToken };
      const response = await autocompleteService.getPlacePredictions(request);

      setPredictionResults(response.predictions);
    },
    [autocompleteService, sessionToken],
  );

  const onInputChange = useCallback(
    (event: FormEvent<HTMLInputElement>) => {
      const value = (event.target as HTMLInputElement)?.value;

      setInputValue(value);
      fetchPredictions(value);
    },
    [fetchPredictions],
  );

  const handleSuggestionClick = useCallback(
    (placeId: string) => {
      if (!places) return;

      const detailRequestOptions = {
        placeId,
        fields: ["geometry", "name", "formatted_address"],
        sessionToken,
      };

      const detailsRequestCallback = (placeDetails: google.maps.places.PlaceResult | null) => {
        onPlaceSelect(placeDetails);
        setPredictionResults([]);
        setInputValue(placeDetails?.formatted_address ?? "");
        setSessionToken(new places.AutocompleteSessionToken());
      };

      placesService?.getDetails(detailRequestOptions, detailsRequestCallback);
    },
    [onPlaceSelect, places, placesService, sessionToken],
  );

  return (
    <div className="flex flex-col -mt-10">
      <p className="-mb-0.5 font-medium font-poppins">Location</p>
      <input
        value={inputValue}
        onInput={(event: FormEvent<HTMLInputElement>) => onInputChange(event)}
        disabled={isOnline}
        placeholder={existingValue ? existingValue : "Search for a place"}
        className="input input-md input-bordered w-80 bg-secondary-content rounded text-black"
      />

      {predictionResults.length > 0 && (
        <ul className="custom-list rounded-xl">
          {predictionResults.map(({ place_id, description }) => {
            return (
              <li
                key={place_id}
                className="custom-list-item max-w-80 hover:bg-primary hover:text-white bg-primary-content border"
                onClick={() => handleSuggestionClick(place_id)}
              >
                {description}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};
