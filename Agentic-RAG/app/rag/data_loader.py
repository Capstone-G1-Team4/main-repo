import os
import pandas as pd
import json


RAW_PATH = "data/raw"
OUTPUT_PATH = "data/processed/products.json"



def clean_text(text):

    if pd.isna(text):
        return ""

    return (
        str(text)
        .replace("\n", " ")
        .replace("ï¿½", " ")
        .strip()
    )



def clean_details(details):

    if pd.isna(details):
        return []

    details = str(details)

    details = (
        details
        .replace("[", "")
        .replace("]", "")
        .replace("'", "")
        .replace("ï¿½", " ")
        .strip()
    )


    specifications = []

    keywords = [
        "Processor",
        "RAM",
        "Operating System",
        "SSD",
        "HDD",
        "Display",
        "Warranty",
        "Battery",
        "Camera",
        "Storage",
        "Graphics",
        "Resolution"
    ]


    words = details.split()

    current = ""


    for word in words:

        current += word + " "


        if any(
            key.lower() in current.lower()
            for key in keywords
        ):

            specifications.append(
                current.strip()
            )

            current = ""


    if current.strip():

        specifications.append(
            current.strip()
        )


    return specifications




def clean_number(value):

    if pd.isna(value):

        return None


    value = (
        str(value)
        .replace(",", "")
        .replace("₹", "")
        .strip()
    )


    try:

        return float(value)

    except:

        return None





def load_products():

    products = []


    files = {

        "laptop": "flipkart_laptops.csv",

        "mobile": "flipkart_mobiles.csv",

        "refrigerator": "flipkart_refrigerator.csv",

        "smart_watch": "flipkart_smart_watch.csv",

        "tv": "flipkart_tv.csv",

        "washing_machine": "flipkart_washing_machine.csv"

    }



    for category, filename in files.items():


        path = os.path.join(
            RAW_PATH,
            filename
        )


        df = pd.read_csv(
            path,
            encoding="latin-1"
        )


        print(
            f"Loading {filename}: {len(df)} products"
        )



        for _, row in df.iterrows():


            product = {


                "name": clean_text(
                    row["Name"]
                ),


                "brand": clean_text(
                    row["Brand"]
                ),


                "category": category,


                "price": clean_number(
                    row["Selling Price"]
                ),


                "rating": clean_number(
                    row["Ratings"]
                ),


                "details": clean_details(
                    row["Details"]
                )

            }



            product["text"] = f"""
Product Name:
{product['name']}

Brand:
{product['brand']}

Category:
{product['category']}

Price:
{product['price']}

Rating:
{product['rating']}

Specifications:
{', '.join(product['details'])}
"""


            products.append(product)



    return products





if __name__ == "__main__":


    products = load_products()



    os.makedirs(
        "data/processed",
        exist_ok=True
    )



    with open(
        OUTPUT_PATH,
        "w",
        encoding="utf-8"
    ) as f:


        json.dump(
            products,
            f,
            ensure_ascii=False,
            indent=2
        )



    print(
        f"Saved {len(products)} products"
    )