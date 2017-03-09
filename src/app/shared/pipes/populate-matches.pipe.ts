import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
    name: 'populateMatches'
})
export class PopulateMatchesPipe implements PipeTransform {

    transform(values: any, keyName?: string): any {
        let keyIndex;
        const populated = values.map((params, index) => {

            let settingsValue = params.value;

            if (settingsValue && params.keyName === keyName) {

                const regex = /(\<(.*?)\>)/gm;
                let foundKey = null;
                while (foundKey = regex.exec(settingsValue)) {

                    const matches = values.filter(settings => settings.keyName === foundKey[2]);

                    if (matches.length) {
                        settingsValue = this.castValues(settingsValue, foundKey[1], matches[0].value);
                    }
                }

                keyIndex = index;
                return settingsValue;

            }

        });

        console.log(populated[keyIndex]);
        return populated[keyIndex];
    }

    private castValues(haystack, needle, replace): string {
        return haystack.replace(needle, replace);
    }

}
