
class Utils {
    public populateMatches(param): any {

        let settingsValue = param.value;

        if (settingsValue) {

            const regex = /(\<(.*?)\>)/gm;
            let foundKey = null;
            while (foundKey = regex.exec(settingsValue)) {
                settingsValue = this.castValues(settingsValue, foundKey[1], param.value);

            }

            param.value = settingsValue;

        }
        return param;
    }

    private castValues(haystack, needle, replace): string {
        return haystack.replace(needle, replace);
    }
}
