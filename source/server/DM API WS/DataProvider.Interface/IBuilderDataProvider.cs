using DDB.Entities;
using Org.Sdmxsource.Sdmx.Api.Model.Objects.CategoryScheme;
using System;
using System.Collections.Generic;
using System.Text;

namespace DataProvider
{
    public interface IBuilderDataProvider
    {
        /// <summary>
        /// Returns the list of cubes in the DDB without Attributes, Dimensions or Measures.
        /// </summary>
        List<Cube> getAvailableCubes();

        /// <summary>
        /// Returns the requested cube with Attributes, Dimensions and Measures.
        /// </summary>
        /// <param name="cubeId">The cube id.</param>
        CubeWithDetails getCube(int cubeId);

        /// <summary>
        /// Creates a cube in the DDB with Attributes, Dimensions and Measures.
        /// </summary>
        /// <param name="cube">The cube to be created.</param>
        /// <returns>The cube id in case of success, otherwise an exception is thrown.</returns>
        int createCube(CubeWithDetails cube);

        /// <summary>
        /// Deletes a cube together with its associated information.
        /// </summary>
        /// <param name="cubeId">The id of the cube to be deleted.</param>
        /// <returns>True in case of success, otherwise an exception is thrown.</returns>
        bool deleteCube(int cubeId);

        /// <summary>
        /// Imports the Default Category Scheme from the MSDB.
        /// </summary>
        /// <param name="catSch">The Category Scheme to be imported.</param>
        /// <param name="orderAnnType">Annotation type for handling the order of the items</param>
        /// <returns>True in case of success, otherwise an exception is thrown.</returns>
        bool importDCSFromMSDB(ICategorySchemeObject catSch, string orderAnnType);

        /// <summary>
        /// Returns the list of categories in the Default Category Scheme.
        /// </summary>
        List<Category> getDCS();

        /// <summary>
        /// Deletes a category from the Default Category Scheme.
        /// </summary>
        /// <param name="catCode">The Code of the category to be deleted.</param>
        /// <returns>True in case of success, false if try to delete category with children or assign to cube.</returns>
        bool DeleteDCS(string catCode);

        /// <summary>
        /// Inserts a new category in the Default Category Scheme.
        /// </summary>
        /// <param name="category">The Category to be inserted.</param>
        /// <returns>The category id in case of success, otherwise an exception is thrown.</returns>
        int InsertDCS(Category category);

        /// <summary>
        /// Updates a category in the Default Category Scheme.
        /// </summary>
        /// <param name="category">The Category to be updated.</param>
        /// <returns></returns>
        void UpdateDCS(Category category);
    }
}
