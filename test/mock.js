define({
  "config": {
    "project": {
      "name": "Finda",
      "description": "<p>Finda is a generic \"find-a\" app for geographic datasets.</p>",
      "contact": "<b>Please send feedback, ideas, and bug reports!</b>"
    },
    "map": {
      "center":[42.3725, -71.1266],
      "zoom":13,
      "maxZoom":16,
      "maxBounds":[
        [39.2, -78.0],
        [44.5, -65.0]
      ]
    },
    "properties":{
      "organization_name": {},
      "address": {},
      "web_url": { "title": "website", "url": true },

      "contact_names": { "title": "Contact Information" },
      "contact_emails": {},
      "phone_numbers": {},

      "services_offered": { "title": "Services" },
      "youth_category": { "title": "Type of Organization" },
      "target_populations": { "title": "Populations Served" },

      "additional_notes": { "title": "Information"}
    },
    "facets": {
      services_offered: {
        title: "Services",
        type: "list"
      }
    }
  },

  "data": {
    "type": "FeatureCollection",
    "features": [
      {
        "type": "Feature",
        "geometry": {
          "type": "Point",
          "coordinates": [
              -72.6411923,
            42.3250492
          ]
        },
        "properties": {
          "address": "2 Conz Street\nMaplewood Shops #34\nFranklin, MA 01060",
          "organization_name": "Generation Q South: Community Action Youth Programs",
          "community": "Northampton",
          "services_offered": [
            "support group",
            "social group"
          ],
          "web_url": "http://www.communityaction.us/our-groups-programs.html",
          "phone_numbers": [
            "413-774-7028"
          ],
          "contact_names": [
            "GenQ@communityaction.us"
          ],
          "contact_emails": [],
          "youth_category": "Community Group",
          "service_class_level_1": "Support Services",
          "service_class_level_2": "Para-professional Counseling, Therapy, and Support",
          "service_classes": [
            "Clubhouse"
          ],
          "target_populations": [
            "LGBTQ youth 12-21"
          ],
          "age_range": "",
          "additional_notes": []
        }
      },
      {
        "type": "Feature",
        "geometry": {
          "type": "Point",
          "coordinates": [
              -72.59839699999999,
            42.593369
          ]
        },
        "properties": {
          "address": "154 Federal Street\nFranklin, MA 01301",
          "organization_name": "Generation Q North: Community Action Youth Programs",
          "community": "Greenfield",
          "services_offered": [
            "support group",
            "social group"
          ],
          "web_url": "http://www.communityaction.us/our-groups-programs.html",
          "phone_numbers": [
            "413-774-7028"
          ],
          "contact_names": [
            "GenQ@communityaction.us"
          ],
          "contact_emails": [],
          "youth_category": "Community Group",
          "service_class_level_1": "Support Services",
          "service_class_level_2": "Para-professional Counseling, Therapy, and Support",
          "service_classes": [
            "Clubhouse"
          ],
          "target_populations": [],
          "age_range": "",
          "additional_notes": []
        }
      },
      {
        "type": "Feature",
        "geometry": {
          "type": "Point",
          "coordinates": [
              -72.73988969999999,
            42.5964078
          ]
        },
        "properties": {
          "address": "53 Elm Street\nFranklin, MA 01370",
          "organization_name": "PFLAG Franklin-Hampshire",
          "community": "Shellbourne Falls",
          "services_offered": [
            "support group",
            "public education"
          ],
          "web_url": "http://community.pflag.org/page.aspx?pid=803",
          "phone_numbers": [
            "(413)-625-6636"
          ],
          "contact_names": [
            "jcmalinski48@gmail.com"
          ],
          "contact_emails": [],
          "youth_category": "Community Group",
          "service_class_level_1": "Support Services",
          "service_class_level_2": "Para-professional Counseling, Therapy, and Support",
          "service_classes": [
            "Community Prevention, Education and Outreach"
          ],
          "target_populations": [
            "parent of LGBTQ youth"
          ],
          "age_range": "",
          "additional_notes": []
        }
      }
    ]
  }

});
